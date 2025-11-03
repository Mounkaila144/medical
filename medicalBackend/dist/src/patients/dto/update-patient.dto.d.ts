import { Gender } from '../entities/patient.entity';
export declare class UpdatePatientDto {
    firstName?: string;
    lastName?: string;
    dob?: Date;
    gender?: Gender;
    bloodType?: string;
    phone?: string;
    email?: string;
    address?: any;
    clinicId?: string;
}
