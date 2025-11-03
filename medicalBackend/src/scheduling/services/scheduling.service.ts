import { Injectable, ConflictException, NotFoundException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, LessThan, MoreThan, Between } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';

import { Appointment } from '../entities/appointment.entity';
import { Practitioner } from '../entities/practitioner.entity';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { RescheduleAppointmentDto } from '../dto/reschedule-appointment.dto';
import { CancelAppointmentDto } from '../dto/cancel-appointment.dto';
import { AppointmentStatus } from '../enums/appointment-status.enum';
import { AppointmentCreatedEvent } from '../events/appointment-created.event';
import { AppointmentCancelledEvent } from '../events/appointment-cancelled.event';

@Injectable()
export class SchedulingService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Practitioner)
    private practitionerRepository: Repository<Practitioner>,
    private eventEmitter: EventEmitter2,
  ) {}

  async book(tenantId: string, createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    // Vérifier que le praticien existe
    const practitioner = await this.practitionerRepository.findOne({
      where: { id: createAppointmentDto.practitionerId },
    });

    if (!practitioner) {
      throw new HttpException(`Praticien avec l'ID ${createAppointmentDto.practitionerId} non trouvé`, HttpStatus.NOT_FOUND);
    }

    // Vérifier la disponibilité du praticien
    const isAvailable = await this.checkAvailability(
      createAppointmentDto.practitionerId,
      createAppointmentDto.startAt,
      createAppointmentDto.endAt,
    );

    if (!isAvailable) {
      throw new HttpException(`Le praticien ${practitioner.firstName} ${practitioner.lastName} n'est pas disponible sur ce créneau`, HttpStatus.CONFLICT);
    }

    console.log('Practitioner found and available, creating appointment...');

    // Créer le rendez-vous
    const appointment = this.appointmentRepository.create({
      tenantId,
      ...createAppointmentDto,
      status: AppointmentStatus.BOOKED,
    });

    const savedAppointment = await this.appointmentRepository.save(appointment);
    
    // Émettre l'événement de création
    this.eventEmitter.emit(
      'appointment.created',
      new AppointmentCreatedEvent(savedAppointment),
    );

    return savedAppointment;
  }

  async reschedule(tenantId: string, rescheduleDto: RescheduleAppointmentDto): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: rescheduleDto.appointmentId, tenantId },
    });

    if (!appointment) {
      throw new NotFoundException('Rendez-vous non trouvé');
    }

    // Si changement de praticien, vérifier sa disponibilité
    const practitionerId = rescheduleDto.practitionerId || appointment.practitionerId;
    const conflictingAppointments = await this.getConflictingAppointments(
      practitionerId,
      rescheduleDto.startAt,
      rescheduleDto.endAt,
      appointment.id,
    );

    if (conflictingAppointments.length > 0) {
      throw new ConflictException('Le praticien n\'est pas disponible sur ce créneau');
    }

    // Mettre à jour le rendez-vous
    appointment.startAt = rescheduleDto.startAt;
    appointment.endAt = rescheduleDto.endAt;
    
    if (rescheduleDto.practitionerId) {
      appointment.practitionerId = rescheduleDto.practitionerId;
    }
    
    if (rescheduleDto.room) {
      appointment.room = rescheduleDto.room;
    }

    return this.appointmentRepository.save(appointment);
  }

  async cancel(
    tenantId: string, 
    appointmentId: string,
    cancelDto?: CancelAppointmentDto,
  ): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId, tenantId },
    });

    if (!appointment) {
      throw new NotFoundException('Rendez-vous non trouvé');
    }

    appointment.status = AppointmentStatus.CANCELLED;
    if (cancelDto?.cancellationReason) {
      appointment.reason = `Annulé: ${cancelDto.cancellationReason}`;
    }
    
    const updatedAppointment = await this.appointmentRepository.save(appointment);
    
    // Émettre l'événement d'annulation
    this.eventEmitter.emit(
      'appointment.cancelled',
      new AppointmentCancelledEvent(updatedAppointment, cancelDto?.notifyPatient ?? true),
    );

    return updatedAppointment;
  }

  async listAgenda(tenantId: string, practitionerId: string, date: Date): Promise<Appointment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.appointmentRepository.find({
      where: {
        tenantId,
        practitionerId,
        startAt: MoreThan(startOfDay),
        endAt: LessThan(endOfDay),
        status: Not(AppointmentStatus.CANCELLED),
      },
      order: { startAt: 'ASC' },
    });
  }

  async getAllAppointments(tenantId: string, dateString?: string): Promise<Appointment[]> {
    const whereCondition: any = { tenantId };
    
    if (dateString) {
      const date = new Date(dateString);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      whereCondition.startAt = MoreThan(startOfDay);
      whereCondition.endAt = LessThan(endOfDay);
    }

    return this.appointmentRepository.find({
      where: whereCondition,
      order: { startAt: 'ASC' },
      relations: ['practitioner'],
    });
  }

  async getAppointmentById(tenantId: string, appointmentId: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId, tenantId },
      relations: ['practitioner'],
    });

    if (!appointment) {
      throw new NotFoundException('Rendez-vous non trouvé');
    }

    return appointment;
  }

  async updateAppointment(
    tenantId: string, 
    appointmentId: string, 
    updateData: Partial<CreateAppointmentDto>
  ): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId, tenantId },
    });

    if (!appointment) {
      throw new NotFoundException('Rendez-vous non trouvé');
    }

    // If updating time or practitioner, check availability
    if (updateData.startAt || updateData.endAt || updateData.practitionerId) {
      const startAt = updateData.startAt || appointment.startAt;
      const endAt = updateData.endAt || appointment.endAt;
      const practitionerId = updateData.practitionerId || appointment.practitionerId;

      const conflictingAppointments = await this.getConflictingAppointments(
        practitionerId,
        startAt,
        endAt,
        appointmentId,
      );

      if (conflictingAppointments.length > 0) {
        throw new ConflictException('Le praticien n\'est pas disponible sur ce créneau');
      }
    }

    // Update the appointment
    Object.assign(appointment, updateData);
    return this.appointmentRepository.save(appointment);
  }

  private async getConflictingAppointments(
    practitionerId: string,
    start: Date,
    end: Date,
    excludeAppointmentId?: string,
  ): Promise<Appointment[]> {
    try {
      // Use a simpler approach with find instead of query builder
      const whereCondition: any = {
        practitionerId,
        status: Not(AppointmentStatus.CANCELLED),
      };

      if (excludeAppointmentId) {
        whereCondition.id = Not(excludeAppointmentId);
      }

      const allAppointments = await this.appointmentRepository.find({
        where: whereCondition,
      });

      // Filter for conflicts in JavaScript to avoid SQL complexity
      const conflictingAppointments = allAppointments.filter(appointment => {
        const appointmentStart = new Date(appointment.startAt);
        const appointmentEnd = new Date(appointment.endAt);
        
        // Check for overlap: (start1 < end2) && (start2 < end1)
        return (appointmentStart < end) && (start < appointmentEnd);
      });

      console.log(`Found ${conflictingAppointments.length} conflicting appointments`);
      
      return conflictingAppointments;
    } catch (error) {
      console.error('Error in getConflictingAppointments:', error);
      console.error('Error stack:', error.stack);
      throw new BadRequestException('Erreur lors de la vérification de disponibilité');
    }
  }

  private async checkAvailability(
    practitionerId: string,
    start: Date,
    end: Date,
    excludeAppointmentId?: string,
  ): Promise<boolean> {
    const conflictingAppointments = await this.getConflictingAppointments(
      practitionerId,
      start,
      end,
      excludeAppointmentId,
    );
    
    return conflictingAppointments.length === 0;
  }

  @Cron('0 0 * * *') // Tous les jours à minuit
  async sendDailyReminders() {
    // Trouver les rendez-vous dans 24h
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startOfDay = new Date(tomorrow);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(tomorrow);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await this.appointmentRepository.find({
      where: {
        startAt: Between(startOfDay, endOfDay),
        status: AppointmentStatus.BOOKED,
      },
      relations: ['practitioner'],
    });

    // Émettre un événement pour chaque rappel
    for (const appointment of appointments) {
      this.eventEmitter.emit('appointment.reminder.24h', { appointment });
    }
  }

  @Cron('0 * * * *') // Toutes les heures
  async sendHourlyReminders() {
    // Trouver les rendez-vous dans 1h
    const oneHourLater = new Date();
    oneHourLater.setHours(oneHourLater.getHours() + 1);
    
    const start = new Date(oneHourLater);
    start.setMinutes(0, 0, 0);
    
    const end = new Date(oneHourLater);
    end.setMinutes(59, 59, 999);

    const appointments = await this.appointmentRepository.find({
      where: {
        startAt: Between(start, end),
        status: AppointmentStatus.BOOKED,
      },
      relations: ['practitioner'],
    });

    // Émettre un événement pour chaque rappel
    for (const appointment of appointments) {
      this.eventEmitter.emit('appointment.reminder.1h', { appointment });
    }
  }

  async getAppointmentsByDateRange(
    tenantId: string,
    practitionerId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: {
        tenantId,
        practitionerId,
        startAt: Between(startDate, endDate),
        status: Not(AppointmentStatus.CANCELLED),
      },
      order: { startAt: 'ASC' },
      relations: ['practitioner'],
    });
  }

  async getPractitionerAvailability(
    tenantId: string,
    practitionerId: string,
    date?: Date,
  ): Promise<Array<{
    startAt: Date;
    endAt: Date;
    duration: number;
    available: boolean;
  }>> {
    // Pour l'instant, retournons une disponibilité par défaut
    // Dans une implémentation complète, vous devriez avoir une entité Availability
    // et récupérer les vraies disponibilités du praticien
    
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(8, 0, 0, 0); // 8h00
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(18, 0, 0, 0); // 18h00
    
    // Récupérer les rendez-vous existants pour cette date
    const existingAppointments = await this.appointmentRepository.find({
      where: {
        tenantId,
        practitionerId,
        startAt: Between(startOfDay, endOfDay),
        status: Not(AppointmentStatus.CANCELLED),
      },
      order: { startAt: 'ASC' },
    });
    
    // Générer les créneaux disponibles (exemple simple)
    const availableSlots: Array<{
      startAt: Date;
      endAt: Date;
      duration: number;
      available: boolean;
    }> = [];
    const slotDuration = 30; // 30 minutes par créneau
    
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotStart = new Date(targetDate);
        slotStart.setHours(hour, minute, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);
        
        // Vérifier si ce créneau est libre
        const isOccupied = existingAppointments.some(appointment => 
          (appointment.startAt <= slotStart && appointment.endAt > slotStart) ||
          (appointment.startAt < slotEnd && appointment.endAt >= slotEnd) ||
          (appointment.startAt >= slotStart && appointment.endAt <= slotEnd)
        );
        
        if (!isOccupied) {
          availableSlots.push({
            startAt: slotStart,
            endAt: slotEnd,
            duration: slotDuration,
            available: true,
          });
        }
      }
    }
    
    return availableSlots;
  }
} 