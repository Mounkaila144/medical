import { Availability } from './availability.entity';
import { Appointment } from './appointment.entity';
export declare class Practitioner {
    id: string;
    tenantId: string;
    firstName: string;
    lastName: string;
    specialty: string;
    color: string;
    availabilities: Availability[];
    appointments: Appointment[];
}
