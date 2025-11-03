import { Response } from 'express';
import { PrescriptionsService } from '../services/prescriptions.service';
import { CreatePrescriptionDto } from '../dto/create-prescription.dto';
import { MinioService } from '../../common/services/minio.service';
export declare class PrescriptionsController {
    private readonly prescriptionsService;
    private readonly minioService;
    private readonly bucketName;
    constructor(prescriptionsService: PrescriptionsService, minioService: MinioService);
    create(createPrescriptionDto: CreatePrescriptionDto, req: any): Promise<import("../entities").Prescription>;
    findAll(req: any): Promise<import("../entities").Prescription[]>;
    findOne(id: string): Promise<import("../entities").Prescription>;
    update(id: string, updatePrescriptionDto: Partial<CreatePrescriptionDto>, req: any): Promise<import("../entities").Prescription>;
    regenerateFiles(id: string, req: any): Promise<import("../entities").Prescription>;
    getQrImage(id: string, req: any, res: Response): Promise<void>;
    downloadFile(id: string, type: string, req: any, res: Response): Promise<void>;
    delete(id: string, req: any): Promise<{
        message: string;
    }>;
}
