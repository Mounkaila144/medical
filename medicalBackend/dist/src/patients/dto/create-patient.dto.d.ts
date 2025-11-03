import { Gender } from '../entities/patient.entity';
export declare class CreatePatientDto {
    clinicId: string;
    mrn?: string;
    firstName: string;
    lastName: string;
    age?: number;
    dob?: Date;
    gender: Gender;
    bloodType?: string;
    phone?: string;
    email?: string;
    address?: any;
}
