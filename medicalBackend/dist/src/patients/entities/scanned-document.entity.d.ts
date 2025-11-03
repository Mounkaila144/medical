import { Patient } from './patient.entity';
export declare enum DocumentType {
    ORDONNANCE = "ORDONNANCE",
    CR = "CR",
    RADIO = "RADIO"
}
export declare class ScannedDocument {
    id: string;
    patientId: string;
    path: string;
    docType: DocumentType;
    tags: string[];
    uploadedBy: string;
    uploadedAt: Date;
    patient: Patient;
}
