import { Repository } from 'typeorm';
import { LabResult } from '../entities/lab-result.entity';
import { CreateLabResultDto } from '../dto/create-lab-result.dto';
export declare class LabResultsService {
    private labResultsRepository;
    constructor(labResultsRepository: Repository<LabResult>);
    add(tenantId: string, createLabResultDto: CreateLabResultDto): Promise<LabResult>;
    findAll(tenantId: string): Promise<LabResult[]>;
    findAllByPatient(tenantId: string, patientId: string): Promise<LabResult[]>;
    findOne(id: string): Promise<LabResult>;
}
