import { MedicalHistoryType } from '../entities/medical-history-item.entity';
export declare class CreateMedicalHistoryItemDto {
    patientId: string;
    type: MedicalHistoryType;
    label: string;
    note: string;
}
