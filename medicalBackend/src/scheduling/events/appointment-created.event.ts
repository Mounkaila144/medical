import { Appointment } from '../entities/appointment.entity';

export class AppointmentCreatedEvent {
  constructor(public readonly appointment: Appointment) {}
} 