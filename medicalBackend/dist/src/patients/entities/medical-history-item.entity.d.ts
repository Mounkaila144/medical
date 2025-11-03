import { Patient } from './patient.entity';
export declare enum MedicalHistoryType {
    ANTECEDENT = "ANTECEDENT",
    ALLERGY = "ALLERGY",
    VACCINE = "VACCINE"
}
export declare class MedicalHistoryItem {
    id: string;
    patientId: string;
    type: MedicalHistoryType;
    label: string;
    note: string;
    recordedAt: Date;
    patient: Patient;
}
