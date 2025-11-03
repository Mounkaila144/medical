import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, MoreThanOrEqual } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { WaitQueueEntry, QueueStatus } from '../entities/wait-queue-entry.entity';
import { CreateWaitQueueEntryDto } from '../dto/create-wait-queue-entry.dto';
import { UpdateWaitQueueEntryDto } from '../dto/update-wait-queue-entry.dto';
import { WaitQueueUpdatedEvent } from '../events/wait-queue-updated.event';

@Injectable()
export class WaitQueueService {
  constructor(
    @InjectRepository(WaitQueueEntry)
    private waitQueueRepository: Repository<WaitQueueEntry>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Génère un numéro de ticket unique pour aujourd'hui
   * Format: A001, A002... Z999
   */
  private async generateTicketNumber(tenantId: string): Promise<string> {
    // Obtenir le début de la journée (minuit)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Compter les tickets créés aujourd'hui pour ce tenant
    const todayCount = await this.waitQueueRepository.count({
      where: {
        tenantId,
        createdAt: MoreThanOrEqual(startOfDay),
      },
    });

    // Calculer la lettre (A-Z) et le numéro (001-999)
    const letter = String.fromCharCode(65 + Math.floor(todayCount / 999));
    const number = String(todayCount % 999 + 1).padStart(3, '0');

    return `${letter}${number}`;
  }

  async enqueue(tenantId: string, createDto: CreateWaitQueueEntryDto): Promise<WaitQueueEntry> {
    // Vérifier si le patient est déjà dans la file d'attente (seulement si patientId est fourni)
    if (createDto.patientId) {
      const existingEntry = await this.waitQueueRepository.findOne({
        where: [
          { tenantId, patientId: createDto.patientId, status: QueueStatus.WAITING },
          { tenantId, patientId: createDto.patientId, status: QueueStatus.CALLED },
          { tenantId, patientId: createDto.patientId, status: QueueStatus.SERVING },
        ],
      });

      if (existingEntry) {
        throw new ConflictException('Le patient est déjà dans la file d\'attente');
      }
    }

    // Trouver le dernier rang (seulement les entrées en attente)
    const lastEntry = await this.waitQueueRepository.findOne({
      where: {
        tenantId,
        status: QueueStatus.WAITING
      },
      order: { rank: 'DESC' },
    });

    const nextRank = lastEntry ? lastEntry.rank + 1 : 1;

    // Générer le numéro de ticket
    const ticketNumber = await this.generateTicketNumber(tenantId);

    // Créer la nouvelle entrée
    const entry = this.waitQueueRepository.create({
      tenantId,
      patientId: createDto.patientId,
      practitionerId: createDto.practitionerId,
      priority: createDto.priority,
      reason: createDto.reason,
      rank: nextRank,
      ticketNumber,
      status: QueueStatus.WAITING,
    });

    const savedEntry = await this.waitQueueRepository.save(entry);

    // Émettre l'événement de mise à jour
    await this.emitQueueUpdatedEvent(tenantId);

    // TODO: Retourner avec les relations une fois qu'elles fonctionnent
    return savedEntry;
  }

  async callNext(tenantId: string): Promise<WaitQueueEntry | null> {
    // Vérifier s'il y a déjà un patient en cours (CALLED ou SERVING)
    const currentEntry = await this.waitQueueRepository.findOne({
      where: [
        { tenantId, status: QueueStatus.CALLED },
        { tenantId, status: QueueStatus.SERVING },
      ],
      order: { calledAt: 'DESC' },
    });

    // Si un patient est déjà en consultation, le marquer comme complété automatiquement
    if (currentEntry) {
      currentEntry.status = QueueStatus.COMPLETED;
      currentEntry.servedAt = new Date();
      await this.waitQueueRepository.save(currentEntry);
    }

    // Trouver le patient suivant en attente (priorité puis ordre d'arrivée)
    const nextEntry = await this.waitQueueRepository.findOne({
      where: { tenantId, status: QueueStatus.WAITING },
      order: { rank: 'ASC' },
    });

    if (!nextEntry) {
      return null;
    }

    // Marquer comme appelé
    nextEntry.status = QueueStatus.CALLED;
    nextEntry.calledAt = new Date();
    await this.waitQueueRepository.save(nextEntry);

    // Émettre l'événement de mise à jour
    await this.emitQueueUpdatedEvent(tenantId);

    return nextEntry;
  }

  async markAsServing(tenantId: string, entryId: string): Promise<WaitQueueEntry> {
    const entry = await this.waitQueueRepository.findOne({
      where: { id: entryId, tenantId, status: QueueStatus.CALLED },
    });

    if (!entry) {
      throw new NotFoundException('Entrée non trouvée ou déjà en cours');
    }

    entry.status = QueueStatus.SERVING;
    const updated = await this.waitQueueRepository.save(entry);

    await this.emitQueueUpdatedEvent(tenantId);

    return updated;
  }

  async complete(tenantId: string, entryId: string): Promise<void> {
    const entry = await this.waitQueueRepository.findOne({
      where: { id: entryId, tenantId },
    });

    if (!entry) {
      throw new NotFoundException('Entrée non trouvée');
    }

    entry.status = QueueStatus.COMPLETED;
    entry.servedAt = new Date();
    await this.waitQueueRepository.save(entry);

    await this.emitQueueUpdatedEvent(tenantId);
  }

  async getQueue(tenantId: string): Promise<WaitQueueEntry[]> {
    return this.waitQueueRepository.find({
      where: [
        { tenantId, status: QueueStatus.WAITING },
        { tenantId, status: QueueStatus.CALLED },
        { tenantId, status: QueueStatus.SERVING },
      ],
      order: { rank: 'ASC' },
      // TODO: Ajouter les relations une fois qu'elles fonctionnent
      // relations: ['patient', 'practitioner'],
    });
  }

  async getCurrentlyServing(tenantId: string): Promise<WaitQueueEntry | null> {
    return this.waitQueueRepository.findOne({
      where: [
        { tenantId, status: QueueStatus.CALLED },
        { tenantId, status: QueueStatus.SERVING },
      ],
      order: { calledAt: 'DESC' },
    });
  }

  async updateEntry(tenantId: string, entryId: string, updateData: UpdateWaitQueueEntryDto): Promise<WaitQueueEntry> {
    try {
      const entry = await this.waitQueueRepository.findOne({
        where: {
          id: entryId,
          tenantId,
          status: QueueStatus.WAITING
        },
      });

      if (!entry) {
        throw new NotFoundException('Entrée de file d\'attente introuvable ou déjà traitée');
      }

      // Si on change le patient, vérifier qu'il n'est pas déjà en file
      if (updateData.patientId && updateData.patientId !== entry.patientId) {
        const existingEntry = await this.waitQueueRepository.findOne({
          where: [
            { tenantId, patientId: updateData.patientId, status: QueueStatus.WAITING },
            { tenantId, patientId: updateData.patientId, status: QueueStatus.CALLED },
            { tenantId, patientId: updateData.patientId, status: QueueStatus.SERVING },
          ],
        });

        if (existingEntry) {
          throw new ConflictException('Le patient est déjà dans la file d\'attente');
        }
      }

      // Mettre à jour les champs
      Object.assign(entry, updateData);
      const updatedEntry = await this.waitQueueRepository.save(entry);

      // Émettre l'événement de mise à jour
      await this.emitQueueUpdatedEvent(tenantId);

      // TODO: Retourner avec les relations une fois qu'elles fonctionnent
      return updatedEntry;
    } catch (error) {
      // Re-lancer les erreurs connues
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      // Transformer les autres erreurs en erreurs internes
      throw new Error(`Erreur lors de la mise à jour de l'entrée: ${error.message}`);
    }
  }

  async removeEntry(tenantId: string, entryId: string): Promise<void> {
    try {
      const entry = await this.waitQueueRepository.findOne({
        where: { id: entryId, tenantId },
      });

      if (!entry) {
        throw new NotFoundException('Entrée de file d\'attente introuvable');
      }

      // Marquer comme annulée plutôt que de supprimer
      entry.status = QueueStatus.CANCELLED;
      entry.servedAt = new Date();
      await this.waitQueueRepository.save(entry);

      // Émettre l'événement de mise à jour
      await this.emitQueueUpdatedEvent(tenantId);
    } catch (error) {
      // Re-lancer les erreurs connues
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Transformer les autres erreurs en erreurs internes
      throw new Error(`Erreur lors de la suppression de l'entrée: ${error.message}`);
    }
  }

  private async emitQueueUpdatedEvent(tenantId: string): Promise<void> {
    try {
      const currentQueue = await this.getQueue(tenantId);
      this.eventEmitter.emit(
        'wait-queue.updated',
        new WaitQueueUpdatedEvent(tenantId, currentQueue),
      );
    } catch (error) {
      // Log l'erreur mais ne pas faire échouer l'opération principale
      console.error('Erreur lors de l\'émission de l\'événement wait-queue.updated:', error);
    }
  }
} 