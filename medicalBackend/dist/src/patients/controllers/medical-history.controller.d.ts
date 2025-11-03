import { MedicalHistoryService } from '../services/medical-history.service';
import { CreateMedicalHistoryItemDto } from '../dto/create-medical-history-item.dto';
import { MedicalHistoryItem } from '../entities/medical-history-item.entity';
export declare class MedicalHistoryController {
    private readonly medicalHistoryService;
    constructor(medicalHistoryService: MedicalHistoryService);
    addItem(createItemDto: CreateMedicalHistoryItemDto, req: any): Promise<MedicalHistoryItem>;
    listByPatient(patientId: string, req: any): Promise<MedicalHistoryItem[]>;
    remove(id: string, req: any): Promise<void>;
}
