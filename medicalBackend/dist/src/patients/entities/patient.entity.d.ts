import { MedicalHistoryItem } from './medical-history-item.entity';
import { ScannedDocument } from './scanned-document.entity';
export declare enum Gender {
    MALE = "M",
    FEMALE = "F",
    OTHER = "O"
}
export declare class Patient {
    id: string;
    clinicId: string;
    mrn: string;
    firstName: string;
    lastName: string;
    dob: Date;
    gender: Gender;
    bloodType: string;
    phone: string;
    email: string;
    address?: any;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    medicalHistory: MedicalHistoryItem[];
    documents: ScannedDocument[];
    private generateMrn;
}
