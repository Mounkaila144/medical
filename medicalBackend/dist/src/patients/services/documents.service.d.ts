import { Repository } from 'typeorm';
import { ScannedDocument } from '../entities/scanned-document.entity';
import { CreateDocumentDto } from '../dto/create-document.dto';
import { PatientsService } from './patients.service';
import { ClientProxy } from '@nestjs/microservices';
export declare class DocumentsService {
    private documentsRepository;
    private patientsService;
    private rabbitmqClient;
    private readonly minioClient;
    private readonly bucketName;
    constructor(documentsRepository: Repository<ScannedDocument>, patientsService: PatientsService, rabbitmqClient: ClientProxy);
    private initBucket;
    upload(file: Express.Multer.File, createDocumentDto: CreateDocumentDto, clinicId: string): Promise<ScannedDocument>;
    list(patientId: string, clinicId: string): Promise<ScannedDocument[]>;
    delete(id: string, clinicId: string): Promise<void>;
}
