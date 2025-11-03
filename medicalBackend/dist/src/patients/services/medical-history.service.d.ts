import { Repository } from 'typeorm';
import { MedicalHistoryItem } from '../entities/medical-history-item.entity';
import { CreateMedicalHistoryItemDto } from '../dto/create-medical-history-item.dto';
import { PatientsService } from './patients.service';
export declare class MedicalHistoryService {
    private medicalHistoryRepository;
    private patientsService;
    constructor(medicalHistoryRepository: Repository<MedicalHistoryItem>, patientsService: PatientsService);
    addItem(createItemDto: CreateMedicalHistoryItemDto, clinicId: string): Promise<MedicalHistoryItem>;
    remove(id: string, clinicId: string): Promise<void>;
    listByPatient(patientId: string, clinicId: string): Promise<MedicalHistoryItem[]>;
}
