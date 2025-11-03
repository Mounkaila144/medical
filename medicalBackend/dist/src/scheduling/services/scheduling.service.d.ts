import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Appointment } from '../entities/appointment.entity';
import { Practitioner } from '../entities/practitioner.entity';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { RescheduleAppointmentDto } from '../dto/reschedule-appointment.dto';
import { CancelAppointmentDto } from '../dto/cancel-appointment.dto';
export declare class SchedulingService {
    private appointmentRepository;
    private practitionerRepository;
    private eventEmitter;
    constructor(appointmentRepository: Repository<Appointment>, practitionerRepository: Repository<Practitioner>, eventEmitter: EventEmitter2);
    book(tenantId: string, createAppointmentDto: CreateAppointmentDto): Promise<Appointment>;
    reschedule(tenantId: string, rescheduleDto: RescheduleAppointmentDto): Promise<Appointment>;
    cancel(tenantId: string, appointmentId: string, cancelDto?: CancelAppointmentDto): Promise<Appointment>;
    listAgenda(tenantId: string, practitionerId: string, date: Date): Promise<Appointment[]>;
    getAllAppointments(tenantId: string, dateString?: string): Promise<Appointment[]>;
    getAppointmentById(tenantId: string, appointmentId: string): Promise<Appointment>;
    updateAppointment(tenantId: string, appointmentId: string, updateData: Partial<CreateAppointmentDto>): Promise<Appointment>;
    private getConflictingAppointments;
    private checkAvailability;
    sendDailyReminders(): Promise<void>;
    sendHourlyReminders(): Promise<void>;
    getAppointmentsByDateRange(tenantId: string, practitionerId: string, startDate: Date, endDate: Date): Promise<Appointment[]>;
    getPractitionerAvailability(tenantId: string, practitionerId: string, date?: Date): Promise<Array<{
        startAt: Date;
        endAt: Date;
        duration: number;
        available: boolean;
    }>>;
}
