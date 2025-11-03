import { Repository } from 'typeorm';
import { Prescription } from '../entities/prescription.entity';
import { PrescriptionItem } from '../entities/prescription-item.entity';
import { CreatePrescriptionDto } from '../dto/create-prescription.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EncountersService } from './encounters.service';
import { MinioService } from '../../common/services/minio.service';
import { Tenant } from '../../auth/entities/tenant.entity';
export declare class PrescriptionsService {
    private prescriptionsRepository;
    private prescriptionItemsRepository;
    private tenantRepository;
    private encountersService;
    private eventEmitter;
    private minioService;
    private readonly bucketName;
    constructor(prescriptionsRepository: Repository<Prescription>, prescriptionItemsRepository: Repository<PrescriptionItem>, tenantRepository: Repository<Tenant>, encountersService: EncountersService, eventEmitter: EventEmitter2, minioService: MinioService);
    create(tenantId: string, createPrescriptionDto: CreatePrescriptionDto): Promise<Prescription>;
    findAll(tenantId: string): Promise<Prescription[]>;
    findOne(id: string): Promise<Prescription>;
    private generatePdf;
    update(id: string, tenantId: string, updateData: Partial<CreatePrescriptionDto>): Promise<Prescription>;
    regenerateFiles(id: string, tenantId: string): Promise<Prescription>;
    delete(id: string, tenantId: string): Promise<void>;
    private generatePdfBuffer;
}
