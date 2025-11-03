import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { UpdatePatientDto } from '../dto/update-patient.dto';
import { SearchPatientDto } from '../dto/search-patient.dto';
import { ClientProxy } from '@nestjs/microservices';
export declare class PatientsService {
    private patientsRepository;
    private rabbitmqClient;
    constructor(patientsRepository: Repository<Patient>, rabbitmqClient: ClientProxy);
    create(createPatientDto: CreatePatientDto, tenantId: string): Promise<Patient>;
    findAll(tenantId: string): Promise<Patient[]>;
    findOne(id: string, tenantId: string): Promise<Patient>;
    update(id: string, updatePatientDto: UpdatePatientDto, tenantId: string): Promise<Patient>;
    archive(id: string, tenantId: string): Promise<void>;
    search(searchParams: SearchPatientDto): Promise<Patient[]>;
}
