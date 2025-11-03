import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Encounter } from '../entities/encounter.entity';
import { CreateEncounterDto } from '../dto/create-encounter.dto';
import { UpdateEncounterDto } from '../dto/update-encounter.dto';
import { LockEncounterDto } from '../dto/lock-encounter.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EncounterLockedEvent } from '../events/encounter-locked.event';

@Injectable()
export class EncountersService {
  constructor(
    @InjectRepository(Encounter)
    private encountersRepository: Repository<Encounter>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(tenantId: string, createEncounterDto: CreateEncounterDto): Promise<Encounter> {
    const encounter = this.encountersRepository.create({
      tenantId,
      patientId: createEncounterDto.patientId,
      practitionerId: createEncounterDto.practitionerId,
      startAt: createEncounterDto.startAt,
      endAt: createEncounterDto.endAt,
      motive: createEncounterDto.motive,
      exam: createEncounterDto.exam,
      diagnosis: createEncounterDto.diagnosis,
      icd10Codes: createEncounterDto.icd10Codes || [],
    });

    return this.encountersRepository.save(encounter);
  }

  async findAll(tenantId: string): Promise<Encounter[]> {
    return this.encountersRepository.find({
      where: { tenantId },
      relations: ['patient', 'practitioner', 'prescriptions', 'labResults'],
    });
  }

  async findOne(id: string): Promise<Encounter> {
    const encounter = await this.encountersRepository.findOne({
      where: { id },
      relations: ['patient', 'practitioner', 'prescriptions', 'labResults'],
    });

    if (!encounter) {
      throw new NotFoundException(`Consultation avec ID ${id} non trouvée`);
    }

    return encounter;
  }

  async update(tenantId: string, updateEncounterDto: UpdateEncounterDto): Promise<Encounter> {
    const encounter = await this.encountersRepository.findOne({
      where: { id: updateEncounterDto.id, tenantId },
    });

    if (!encounter) {
      throw new NotFoundException(`Consultation avec ID ${updateEncounterDto.id} non trouvée`);
    }

    if (encounter.locked) {
      throw new ForbiddenException('La consultation est verrouillée et ne peut pas être modifiée');
    }

    Object.assign(encounter, updateEncounterDto);
    
    return this.encountersRepository.save(encounter);
  }

  async lock(tenantId: string, lockEncounterDto: LockEncounterDto): Promise<Encounter> {
    const encounter = await this.encountersRepository.findOne({
      where: { id: lockEncounterDto.id, tenantId },
      relations: ['patient', 'practitioner'],
    });

    if (!encounter) {
      throw new NotFoundException(`Consultation avec ID ${lockEncounterDto.id} non trouvée`);
    }

    encounter.locked = true;
    
    const savedEncounter = await this.encountersRepository.save(encounter);
    
    // Émettre l'événement de verrouillage
    this.eventEmitter.emit('encounter.locked', new EncounterLockedEvent(savedEncounter));
    
    return savedEncounter;
  }
} 