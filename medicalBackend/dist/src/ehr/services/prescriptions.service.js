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
exports.PrescriptionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const prescription_entity_1 = require("../entities/prescription.entity");
const prescription_item_entity_1 = require("../entities/prescription-item.entity");
const event_emitter_1 = require("@nestjs/event-emitter");
const prescription_generated_event_1 = require("../events/prescription-generated.event");
const encounters_service_1 = require("./encounters.service");
const minio_service_1 = require("../../common/services/minio.service");
const tenant_entity_1 = require("../../auth/entities/tenant.entity");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
let PrescriptionsService = class PrescriptionsService {
    prescriptionsRepository;
    prescriptionItemsRepository;
    tenantRepository;
    encountersService;
    eventEmitter;
    minioService;
    bucketName = 'medical-prescriptions';
    constructor(prescriptionsRepository, prescriptionItemsRepository, tenantRepository, encountersService, eventEmitter, minioService) {
        this.prescriptionsRepository = prescriptionsRepository;
        this.prescriptionItemsRepository = prescriptionItemsRepository;
        this.tenantRepository = tenantRepository;
        this.encountersService = encountersService;
        this.eventEmitter = eventEmitter;
        this.minioService = minioService;
    }
    async create(tenantId, createPrescriptionDto) {
        const encounter = await this.encountersService.findOne(createPrescriptionDto.encounterId);
        if (encounter.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Consultation non trouvée');
        }
        const prescription = this.prescriptionsRepository.create({
            encounterId: createPrescriptionDto.encounterId,
            practitionerId: createPrescriptionDto.practitionerId,
            expiresAt: createPrescriptionDto.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
        const savedPrescription = await this.prescriptionsRepository.save(prescription);
        const items = createPrescriptionDto.items.map(item => this.prescriptionItemsRepository.create({
            ...item,
            prescriptionId: savedPrescription.id,
        }));
        await this.prescriptionItemsRepository.save(items);
        const pdfInfo = await this.generatePdf(savedPrescription, createPrescriptionDto, tenantId);
        savedPrescription.pdfPath = pdfInfo.pdfPath;
        savedPrescription.qr = pdfInfo.qrPath;
        const updatedPrescription = await this.prescriptionsRepository.save(savedPrescription);
        this.eventEmitter.emit('prescription.generated', new prescription_generated_event_1.PrescriptionGeneratedEvent(updatedPrescription));
        return updatedPrescription;
    }
    async findAll(tenantId) {
        return this.prescriptionsRepository
            .createQueryBuilder('prescription')
            .innerJoin('prescription.encounter', 'encounter')
            .leftJoinAndSelect('prescription.encounter', 'encounterData')
            .leftJoinAndSelect('encounterData.patient', 'patient')
            .leftJoinAndSelect('prescription.practitioner', 'practitioner')
            .leftJoinAndSelect('prescription.items', 'items')
            .where('encounter.tenantId = :tenantId', { tenantId })
            .getMany();
    }
    async findOne(id) {
        const prescription = await this.prescriptionsRepository.findOne({
            where: { id },
            relations: ['encounter', 'practitioner', 'encounter.patient', 'items'],
        });
        if (!prescription) {
            throw new common_1.NotFoundException(`Prescription avec ID ${id} non trouvée`);
        }
        return prescription;
    }
    async generatePdf(prescription, createPrescriptionDto, tenantId) {
        const prescriptionId = prescription.id;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const tenant = await this.tenantRepository.findOne({
            where: { id: tenantId }
        });
        const qrObjectName = `${tenantId}/prescriptions/qr/${prescriptionId}.png`;
        const pdfObjectName = `${tenantId}/prescriptions/pdf/${prescriptionId}.pdf`;
        const qrData = JSON.stringify({
            prescriptionId: prescription.id,
            encounterId: prescription.encounterId,
            timestamp: new Date().toISOString(),
        });
        const qrBuffer = await QRCode.toBuffer(qrData, {
            type: 'png',
            width: 300,
            margin: 2,
        });
        await this.minioService.uploadBuffer(this.bucketName, qrObjectName, qrBuffer, 'image/png', {
            'X-Prescription-Id': prescriptionId,
            'X-Tenant-Id': tenantId,
        });
        const pdfBuffer = await this.generatePdfBuffer(prescription, createPrescriptionDto, qrBuffer, tenant);
        await this.minioService.uploadBuffer(this.bucketName, pdfObjectName, pdfBuffer, 'application/pdf', {
            'X-Prescription-Id': prescriptionId,
            'X-Tenant-Id': tenantId,
        });
        return {
            pdfPath: pdfObjectName,
            qrPath: qrObjectName
        };
    }
    async update(id, tenantId, updateData) {
        const existingPrescription = await this.prescriptionsRepository
            .createQueryBuilder('prescription')
            .innerJoin('prescription.encounter', 'encounter')
            .where('prescription.id = :id', { id })
            .andWhere('encounter.tenantId = :tenantId', { tenantId })
            .getOne();
        if (!existingPrescription) {
            throw new common_1.NotFoundException('Prescription non trouvée');
        }
        const oldPdfPath = existingPrescription.pdfPath;
        const oldQrPath = existingPrescription.qr;
        if (updateData.encounterId) {
            const encounter = await this.encountersService.findOne(updateData.encounterId);
            if (encounter.tenantId !== tenantId) {
                throw new common_1.NotFoundException('Consultation non trouvée');
            }
            existingPrescription.encounterId = updateData.encounterId;
        }
        if (updateData.practitionerId) {
            existingPrescription.practitionerId = updateData.practitionerId;
        }
        if (updateData.expiresAt !== undefined) {
            existingPrescription.expiresAt = updateData.expiresAt;
        }
        let updatedPrescription = await this.prescriptionsRepository.save(existingPrescription);
        let shouldRegenerateFiles = false;
        if (updateData.items) {
            await this.prescriptionItemsRepository.delete({ prescriptionId: id });
            const newItems = updateData.items.map(item => this.prescriptionItemsRepository.create({
                ...item,
                prescriptionId: id,
            }));
            await this.prescriptionItemsRepository.save(newItems);
            shouldRegenerateFiles = true;
        }
        if (shouldRegenerateFiles && updateData.items) {
            console.log('🔄 Début de la régénération des fichiers PDF/QR pour prescription:', id);
            try {
                if (oldPdfPath) {
                    console.log('🗑️ Suppression ancien PDF:', oldPdfPath);
                    const pdfExists = await this.minioService.objectExists(this.bucketName, oldPdfPath);
                    if (pdfExists) {
                        await this.minioService.removeObject(this.bucketName, oldPdfPath);
                        console.log('✅ Ancien PDF supprimé');
                    }
                }
                if (oldQrPath) {
                    console.log('🗑️ Suppression ancien QR:', oldQrPath);
                    const qrExists = await this.minioService.objectExists(this.bucketName, oldQrPath);
                    if (qrExists) {
                        await this.minioService.removeObject(this.bucketName, oldQrPath);
                        console.log('✅ Ancien QR supprimé');
                    }
                }
                const fullPrescriptionData = {
                    encounterId: updatedPrescription.encounterId,
                    practitionerId: updatedPrescription.practitionerId,
                    expiresAt: updatedPrescription.expiresAt,
                    items: updateData.items,
                };
                console.log('📝 Génération nouveau PDF avec', fullPrescriptionData.items.length, 'médicament(s)');
                const pdfInfo = await this.generatePdf(updatedPrescription, fullPrescriptionData, tenantId);
                console.log('✅ Nouveaux fichiers générés:', { pdf: pdfInfo.pdfPath, qr: pdfInfo.qrPath });
                updatedPrescription.pdfPath = pdfInfo.pdfPath;
                updatedPrescription.qr = pdfInfo.qrPath;
                updatedPrescription = await this.prescriptionsRepository.save(updatedPrescription);
                console.log('✅ Prescription mise à jour avec nouveaux chemins de fichiers');
            }
            catch (error) {
                console.error('❌ Erreur lors de la régénération des fichiers:', error);
            }
        }
        return this.findOne(id);
    }
    async regenerateFiles(id, tenantId) {
        console.log(`🔄 Début de la régénération manuelle pour prescription: ${id}`);
        const prescription = await this.prescriptionsRepository
            .createQueryBuilder('prescription')
            .innerJoin('prescription.encounter', 'encounter')
            .leftJoinAndSelect('prescription.encounter', 'encounterData')
            .leftJoinAndSelect('prescription.practitioner', 'practitioner')
            .leftJoinAndSelect('prescription.items', 'items')
            .where('prescription.id = :id', { id })
            .andWhere('encounter.tenantId = :tenantId', { tenantId })
            .getOne();
        if (!prescription) {
            throw new common_1.NotFoundException('Prescription non trouvée');
        }
        if (!prescription.items || prescription.items.length === 0) {
            throw new common_1.NotFoundException('Aucun médicament trouvé pour cette prescription');
        }
        console.log(`📋 Prescription trouvée avec ${prescription.items.length} médicament(s)`);
        try {
            if (prescription.pdfPath) {
                const pdfExists = await this.minioService.objectExists(this.bucketName, prescription.pdfPath);
                if (pdfExists) {
                    await this.minioService.removeObject(this.bucketName, prescription.pdfPath);
                    console.log('🗑️ Ancien PDF supprimé');
                }
            }
            if (prescription.qr) {
                const qrExists = await this.minioService.objectExists(this.bucketName, prescription.qr);
                if (qrExists) {
                    await this.minioService.removeObject(this.bucketName, prescription.qr);
                    console.log('🗑️ Ancien QR supprimé');
                }
            }
        }
        catch (error) {
            console.warn('⚠️ Erreur lors de la suppression des anciens fichiers:', error);
        }
        const prescriptionData = {
            encounterId: prescription.encounterId,
            practitionerId: prescription.practitionerId,
            expiresAt: prescription.expiresAt,
            items: prescription.items.map(item => ({
                medication: item.medication,
                dosage: item.dosage,
                frequency: item.frequency,
                duration: item.duration,
                instructions: item.instructions,
            })),
        };
        console.log('📝 Génération des nouveaux fichiers...');
        const pdfInfo = await this.generatePdf(prescription, prescriptionData, tenantId);
        prescription.pdfPath = pdfInfo.pdfPath;
        prescription.qr = pdfInfo.qrPath;
        const updatedPrescription = await this.prescriptionsRepository.save(prescription);
        console.log('✅ Fichiers régénérés avec succès:', {
            pdf: pdfInfo.pdfPath,
            qr: pdfInfo.qrPath
        });
        return this.findOne(id);
    }
    async delete(id, tenantId) {
        const prescription = await this.prescriptionsRepository
            .createQueryBuilder('prescription')
            .innerJoin('prescription.encounter', 'encounter')
            .where('prescription.id = :id', { id })
            .andWhere('encounter.tenantId = :tenantId', { tenantId })
            .getOne();
        if (!prescription) {
            throw new common_1.NotFoundException('Prescription non trouvée');
        }
        try {
            if (prescription.pdfPath) {
                const pdfExists = await this.minioService.objectExists(this.bucketName, prescription.pdfPath);
                if (pdfExists) {
                    await this.minioService.removeObject(this.bucketName, prescription.pdfPath);
                }
            }
            if (prescription.qr) {
                const qrExists = await this.minioService.objectExists(this.bucketName, prescription.qr);
                if (qrExists) {
                    await this.minioService.removeObject(this.bucketName, prescription.qr);
                }
            }
        }
        catch (error) {
            console.error('Erreur lors de la suppression des fichiers MinIO:', error);
        }
        await this.prescriptionItemsRepository.delete({ prescriptionId: id });
        await this.prescriptionsRepository.delete(id);
    }
    async generatePdfBuffer(prescription, createPrescriptionDto, qrBuffer, tenant = null) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 60,
                info: {
                    Title: 'Prescription Médicale',
                    Author: 'Système Médical',
                    Subject: `Prescription pour ${prescription.encounter?.patient?.firstName} ${prescription.encounter?.patient?.lastName}`,
                    Creator: 'Medical System PDF Generator'
                }
            });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            const primaryColor = '#2563eb';
            const secondaryColor = '#64748b';
            const accentColor = '#059669';
            const lightGray = '#f1f5f9';
            const darkGray = '#334155';
            doc.rect(0, 0, doc.page.width, 80).fill(primaryColor);
            const clinicName = tenant?.name || 'Clinique Médicale';
            doc.fillColor('white')
                .fontSize(16)
                .font('Helvetica-Bold')
                .text(clinicName.toUpperCase(), 60, 15, { align: 'center' });
            doc.fontSize(14)
                .font('Helvetica-Bold')
                .text('PRESCRIPTION MÉDICALE', 60, 35, { align: 'center' });
            doc.fontSize(9)
                .font('Helvetica')
                .text(`Généré le ${new Date().toLocaleString('fr-FR')}`, 60, 55, { align: 'center' });
            doc.fillColor(darkGray);
            let yPosition = 100;
            doc.rect(60, yPosition, doc.page.width - 120, 50)
                .stroke(secondaryColor)
                .lineWidth(1);
            doc.rect(60, yPosition, doc.page.width - 120, 15)
                .fill(lightGray);
            doc.fillColor(darkGray)
                .fontSize(10)
                .font('Helvetica-Bold')
                .text('INFORMATIONS PATIENT & PRATICIEN', 70, yPosition + 5);
            yPosition += 20;
            const patientName = `${prescription.encounter?.patient?.firstName || ''} ${prescription.encounter?.patient?.lastName || ''}`.trim();
            const patientMrn = prescription.encounter?.patient?.mrn || 'N/A';
            const practitionerName = `Dr. ${prescription.practitioner?.firstName || ''} ${prescription.practitioner?.lastName || ''}`.trim();
            doc.fillColor(darkGray)
                .fontSize(9)
                .font('Helvetica')
                .text(`Patient: ${patientName} (${patientMrn})`, 70, yPosition)
                .text(`Prescripteur: ${practitionerName}`, 70, yPosition + 12);
            const prescriptionDate = new Date().toLocaleDateString('fr-FR');
            const expiryDate = prescription.expiresAt ? prescription.expiresAt.toLocaleDateString('fr-FR') : 'N/A';
            doc.text(`Date: ${prescriptionDate}`, 350, yPosition)
                .text(`Expire: ${expiryDate}`, 350, yPosition + 12);
            yPosition += 30;
            doc.rect(60, yPosition, doc.page.width - 120, 20)
                .fill(accentColor);
            doc.fillColor('white')
                .fontSize(11)
                .font('Helvetica-Bold')
                .text('MÉDICAMENTS PRESCRITS', 70, yPosition + 7);
            yPosition += 25;
            doc.fillColor(darkGray);
            const availableHeight = doc.page.height - yPosition - 120;
            const maxMedicationHeight = Math.min(40, Math.floor(availableHeight / createPrescriptionDto.items.length) - 5);
            createPrescriptionDto.items.forEach((item, index) => {
                doc.rect(60, yPosition, doc.page.width - 120, maxMedicationHeight)
                    .stroke(secondaryColor)
                    .lineWidth(0.5);
                doc.rect(60, yPosition, 25, maxMedicationHeight)
                    .fill(lightGray);
                doc.fillColor(primaryColor)
                    .fontSize(12)
                    .font('Helvetica-Bold')
                    .text(`${index + 1}`, 65, yPosition + (maxMedicationHeight / 2) - 6, { align: 'center', width: 15 });
                doc.fillColor(darkGray)
                    .fontSize(10)
                    .font('Helvetica-Bold')
                    .text(item.medication, 90, yPosition + 3, { width: 200 });
                doc.fontSize(8)
                    .font('Helvetica')
                    .fillColor(secondaryColor)
                    .text(`${item.dosage} - ${item.frequency}`, 90, yPosition + 15, { width: 200 });
                let additionalInfo = '';
                if (item.duration)
                    additionalInfo += `Durée: ${item.duration}`;
                if (item.instructions) {
                    if (additionalInfo)
                        additionalInfo += ' | ';
                    additionalInfo += `Instructions: ${item.instructions}`;
                }
                if (additionalInfo) {
                    doc.text(additionalInfo, 90, yPosition + 25, {
                        width: doc.page.width - 180,
                        height: maxMedicationHeight - 28
                    });
                }
                yPosition += maxMedicationHeight + 2;
            });
            yPosition += 10;
            doc.rect(60, yPosition, doc.page.width - 120, 60)
                .stroke(secondaryColor)
                .lineWidth(0.5);
            doc.image(qrBuffer, 70, yPosition + 10, {
                fit: [40, 40]
            });
            doc.fillColor(darkGray)
                .fontSize(8)
                .font('Helvetica-Bold')
                .text('Authentification QR', 120, yPosition + 10);
            doc.fontSize(7)
                .font('Helvetica')
                .fillColor(secondaryColor)
                .text('Code QR pour vérification', 120, yPosition + 22)
                .text(`ID: ${prescription.id.substring(0, 8)}...`, 120, yPosition + 32);
            doc.fontSize(8)
                .fillColor(darkGray)
                .text(`${clinicName}`, 300, yPosition + 10)
                .fontSize(7)
                .fillColor(secondaryColor)
                .text('Document confidentiel', 300, yPosition + 22)
                .text(`${new Date().toLocaleDateString('fr-FR')}`, 300, yPosition + 32);
            yPosition += 70;
            doc.rect(0, yPosition, doc.page.width, 20)
                .fill(lightGray);
            doc.fillColor(secondaryColor)
                .fontSize(7)
                .font('Helvetica')
                .text(`© ${new Date().getFullYear()} ${clinicName} - En cas de questions, veuillez contacter votre praticien`, 60, yPosition + 8);
            doc.end();
        });
    }
};
exports.PrescriptionsService = PrescriptionsService;
exports.PrescriptionsService = PrescriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(prescription_entity_1.Prescription)),
    __param(1, (0, typeorm_1.InjectRepository)(prescription_item_entity_1.PrescriptionItem)),
    __param(2, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        encounters_service_1.EncountersService,
        event_emitter_1.EventEmitter2,
        minio_service_1.MinioService])
], PrescriptionsService);
//# sourceMappingURL=prescriptions.service.js.map