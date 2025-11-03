import { UrgencyLevel } from '../enums/urgency-level.enum';
export declare class CreateAppointmentDto {
    patientId: string;
    practitionerId: string;
    startAt: Date;
    endAt: Date;
    room?: string;
    reason?: string;
    urgency?: UrgencyLevel;
}
