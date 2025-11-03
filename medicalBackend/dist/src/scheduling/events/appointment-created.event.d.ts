import { Appointment } from '../entities/appointment.entity';
export declare class AppointmentCreatedEvent {
    readonly appointment: Appointment;
    constructor(appointment: Appointment);
}
