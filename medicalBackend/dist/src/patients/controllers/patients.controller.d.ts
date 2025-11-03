import { PatientsService } from '../services/patients.service';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { UpdatePatientDto } from '../dto/update-patient.dto';
import { SearchPatientDto } from '../dto/search-patient.dto';
import { Patient } from '../entities/patient.entity';
import { WhatsappService } from '../services/whatsapp.service';
export declare class PatientsController {
    private readonly patientsService;
    private readonly whatsappService;
    constructor(patientsService: PatientsService, whatsappService: WhatsappService);
    create(createPatientDto: CreatePatientDto, req: any, res: any): Promise<void>;
    findAll(req: any, query: any): Promise<Patient[]>;
    search(searchParams: SearchPatientDto, req: any): Promise<Patient[]>;
    findOne(id: string, req: any): Promise<Patient>;
    update(id: string, updatePatientDto: UpdatePatientDto, req: any): Promise<Patient>;
    remove(id: string, req: any): Promise<void>;
}
