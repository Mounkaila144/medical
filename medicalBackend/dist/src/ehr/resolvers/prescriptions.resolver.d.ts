import { PrescriptionsService } from '../services/prescriptions.service';
import { Prescription } from '../entities/prescription.entity';
import { CreatePrescriptionGqlDto } from '../dto/create-prescription.dto';
export declare class PrescriptionsResolver {
    private readonly prescriptionsService;
    constructor(prescriptionsService: PrescriptionsService);
    createPrescription(createPrescriptionDto: CreatePrescriptionGqlDto, context: any): Promise<Prescription>;
    prescriptions(context: any): Promise<Prescription[]>;
    prescription(id: string): Promise<Prescription>;
}
