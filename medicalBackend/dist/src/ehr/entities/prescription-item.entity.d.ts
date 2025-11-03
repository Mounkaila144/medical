import { Prescription } from './prescription.entity';
export declare class PrescriptionItem {
    id: string;
    prescription: Prescription;
    prescriptionId: string;
    medication: string;
    dosage: string;
    frequency: string;
    duration?: string;
    instructions?: string;
}
