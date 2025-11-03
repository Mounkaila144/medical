import { Availability } from './availability.entity';
import { Appointment } from './appointment.entity';
import { User } from '../../auth/entities/user.entity';
export declare class Practitioner {
    id: string;
    tenantId: string;
    firstName: string;
    lastName: string;
    specialty: string;
    color: string;
    email: string;
    phoneNumber: string;
    slotDuration: number;
    userId: string;
    user: User;
    availabilities: Availability[];
    appointments: Appointment[];
}
