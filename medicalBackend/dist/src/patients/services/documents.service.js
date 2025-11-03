"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const scanned_document_entity_1 = require("../entities/scanned-document.entity");
const patients_service_1 = require("./patients.service");
const microservices_1 = require("@nestjs/microservices");
const common_2 = require("@nestjs/common");
const Minio = require("minio");
const uuid_1 = require("uuid");
let DocumentsService = class DocumentsService {
    documentsRepository;
    patientsService;
    rabbitmqClient;
    minioClient;
    bucketName = 'patient-documents';
    constructor(documentsRepository, patientsService, rabbitmqClient) {
        this.documentsRepository = documentsRepository;
        this.patientsService = patientsService;
        this.rabbitmqClient = rabbitmqClient;
        this.minioClient = new Minio.Client({
            endPoint: process.env.MINIO_ENDPOINT || 'localhost',
            port: parseInt(process.env.MINIO_PORT || '9000'),
            useSSL: process.env.MINIO_USE_SSL === 'true',
            accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
            secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
        });
        this.initBucket().catch(err => {
            console.error('MinIO initialization error:', err);
        });
    }
    async initBucket() {
        const exists = await this.minioClient.bucketExists(this.bucketName);
        if (!exists) {
            await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        }
    }
    async upload(file, createDocumentDto, clinicId) {
        const patient = await this.patientsService.findOne(createDocumentDto.patientId, clinicId);
        const fileExtension = file.originalname.split('.').pop();
        const objectName = `${clinicId}/${patient.id}/${(0, uuid_1.v4)()}.${fileExtension}`;
        try {
            await this.minioClient.putObject(this.bucketName, objectName, file.buffer, file.size, {
                'Content-Type': file.mimetype,
                'X-Patient-Id': patient.id,
                'X-Clinic-Id': clinicId,
            });
            const document = this.documentsRepository.create({
                ...createDocumentDto,
                path: objectName,
                uploadedAt: new Date(),
            });
            const savedDocument = await this.documentsRepository.save(document);
            this.rabbitmqClient.emit('document.uploaded', {
                document: savedDocument,
                patientId: patient.id,
                clinicId: clinicId,
                timestamp: new Date(),
            });
            return savedDocument;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`Failed to upload document: ${error.message}`);
        }
    }
    async list(patientId, clinicId) {
        await this.patientsService.findOne(patientId, clinicId);
        return this.documentsRepository.find({
            where: { patientId },
            order: { uploadedAt: 'DESC' },
        });
    }
    async delete(id, clinicId) {
        const document = await this.documentsRepository.findOne({
            where: { id },
            relations: ['patient'],
        });
        if (!document) {
            throw new common_1.NotFoundException(`Document with ID ${id} not found`);
        }
        if (document.patient.clinicId !== clinicId) {
            throw new common_1.NotFoundException(`Document with ID ${id} not found`);
        }
        try {
            await this.minioClient.removeObject(this.bucketName, document.path);
            await this.documentsRepository.remove(document);
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`Failed to delete document: ${error.message}`);
        }
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(scanned_document_entity_1.ScannedDocument)),
    __param(2, (0, common_2.Inject)('RABBITMQ_SERVICE')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        patients_service_1.PatientsService,
        microservices_1.ClientProxy])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map