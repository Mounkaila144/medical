import { Practitioner } from './practitioner.entity';
export declare enum AppointmentStatus {
    BOOKED = "BOOKED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    NO_SHOW = "NO_SHOW"
}
export declare enum UrgencyLevel {
    ROUTINE = "ROUTINE",
    URGENT = "URGENT",
    EMERGENCY = "EMERGENCY"
}
export declare class Appointment {
    id: string;
    tenantId: string;
    patientId: string;
    practitionerId: string;
    status: string;
    startAt: Date;
    endAt: Date;
    room: string;
    reason: string;
    urgency: string;
    practitioner: Practitioner;
}
