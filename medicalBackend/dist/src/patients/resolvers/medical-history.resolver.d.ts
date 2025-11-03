import { MedicalHistoryItem } from '../entities/medical-history-item.entity';
import { MedicalHistoryService } from '../services/medical-history.service';
import { CreateMedicalHistoryItemDto } from '../dto/create-medical-history-item.dto';
export declare class MedicalHistoryResolver {
    private readonly medicalHistoryService;
    constructor(medicalHistoryService: MedicalHistoryService);
    patientMedicalHistory(patientId: string, context: any): Promise<MedicalHistoryItem[]>;
    addMedicalHistoryItem(createItemDto: CreateMedicalHistoryItemDto, context: any): Promise<MedicalHistoryItem>;
    removeMedicalHistoryItem(id: string, context: any): Promise<boolean>;
}
