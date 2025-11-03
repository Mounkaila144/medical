import { LabResultsService } from '../services/lab-results.service';
import { CreateLabResultDto } from '../dto/create-lab-result.dto';
export declare class LabResultsController {
    private readonly labResultsService;
    constructor(labResultsService: LabResultsService);
    create(createLabResultDto: CreateLabResultDto, req: any): Promise<import("../entities").LabResult>;
    findAll(req: any): Promise<import("../entities").LabResult[]>;
    findAllByPatient(patientId: string, req: any): Promise<import("../entities").LabResult[]>;
    findOne(id: string): Promise<import("../entities").LabResult>;
}
