import { Appointment } from '../entities/appointment.entity';
export declare class AppointmentCancelledEvent {
    readonly appointment: Appointment;
    readonly notifyPatient: boolean;
    constructor(appointment: Appointment, notifyPatient?: boolean);
}
