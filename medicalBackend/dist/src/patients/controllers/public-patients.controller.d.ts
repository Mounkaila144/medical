import { PatientsService } from '../services/patients.service';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { WhatsappService } from '../services/whatsapp.service';
export declare class PublicPatientsController {
    private readonly patientsService;
    private readonly whatsappService;
    constructor(patientsService: PatientsService, whatsappService: WhatsappService);
    createAndRedirect(createPatientDto: CreatePatientDto, tenantId: string, res: any): Promise<void>;
}
