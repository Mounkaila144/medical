import { Gender } from '../entities/patient.entity';
export declare class SearchPatientDto {
    clinicId?: string;
    search?: string;
    mrn?: string;
    firstName?: string;
    lastName?: string;
    gender?: Gender;
    email?: string;
    phone?: string;
}
