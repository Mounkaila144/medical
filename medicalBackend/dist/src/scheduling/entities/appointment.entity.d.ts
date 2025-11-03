import { Practitioner } from './practitioner.entity';
import { AppointmentStatus } from '../enums/appointment-status.enum';
import { UrgencyLevel } from '../enums/urgency-level.enum';
export declare class Appointment {
    id: string;
    tenantId: string;
    patientId: string;
    practitionerId: string;
    status: AppointmentStatus;
    startAt: Date;
    endAt: Date;
    room: string;
    reason: string;
    urgency: UrgencyLevel;
    practitioner: Practitioner;
}
