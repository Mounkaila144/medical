import { LabResultsService } from '../services/lab-results.service';
import { LabResult } from '../entities/lab-result.entity';
import { CreateLabResultDto } from '../dto/create-lab-result.dto';
export declare class LabResultsResolver {
    private readonly labResultsService;
    constructor(labResultsService: LabResultsService);
    addLabResult(createLabResultDto: CreateLabResultDto, context: any): Promise<LabResult>;
    labResults(context: any): Promise<LabResult[]>;
    patientLabResults(patientId: string, context: any): Promise<LabResult[]>;
    labResult(id: string): Promise<LabResult>;
}
