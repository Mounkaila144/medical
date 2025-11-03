import { Appointment } from '../entities/appointment.entity';

export class AppointmentCancelledEvent {
  constructor(
    public readonly appointment: Appointment,
    public readonly notifyPatient: boolean = true,
  ) {}
} 