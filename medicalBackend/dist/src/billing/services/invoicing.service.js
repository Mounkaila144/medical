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
exports.InvoicingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const entities_1 = require("../entities");
const events_1 = require("../events");
const minio_service_1 = require("../../common/services/minio.service");
const tenant_entity_1 = require("../../auth/entities/tenant.entity");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
let InvoicingService = class InvoicingService {
    invoiceRepository;
    invoiceLineRepository;
    tenantRepository;
    eventEmitter;
    minioService;
    bucketName = 'medical-invoices';
    constructor(invoiceRepository, invoiceLineRepository, tenantRepository, eventEmitter, minioService) {
        this.invoiceRepository = invoiceRepository;
        this.invoiceLineRepository = invoiceLineRepository;
        this.tenantRepository = tenantRepository;
        this.eventEmitter = eventEmitter;
        this.minioService = minioService;
    }
    async createDraft(tenantId, createInvoiceDto) {
        const invoice = this.invoiceRepository.create({
            tenantId,
            patientId: createInvoiceDto.patientId,
            number: createInvoiceDto.number || `INV-${Date.now()}`,
            status: entities_1.InvoiceStatus.DRAFT,
            dueAt: createInvoiceDto.dueAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            encounterId: createInvoiceDto.encounterId,
            issueDate: createInvoiceDto.issueDate || new Date(),
            billingAddress: createInvoiceDto.billingAddress,
            notes: createInvoiceDto.notes,
        });
        return this.invoiceRepository.save(invoice);
    }
    async addLine(tenantId, addLineDto) {
        const invoice = await this.invoiceRepository.findOne({
            where: { id: addLineDto.invoiceId, tenantId },
            relations: ['lines'],
        });
        if (!invoice) {
            throw new common_1.NotFoundException(`Invoice with ID ${addLineDto.invoiceId} not found`);
        }
        if (invoice.status !== entities_1.InvoiceStatus.DRAFT) {
            throw new Error('Cannot add lines to an invoice that is not in DRAFT status');
        }
        const invoiceLine = this.invoiceLineRepository.create({
            invoiceId: invoice.id,
            description: addLineDto.description,
            qty: addLineDto.qty,
            unitPrice: addLineDto.unitPrice,
            thirdPartyRate: addLineDto.thirdPartyRate,
            tax: addLineDto.tax,
        });
        await this.invoiceLineRepository.save(invoiceLine);
        return this.recalculateTotal(invoice.id);
    }
    async send(tenantId, updateStatusDto) {
        const invoice = await this.invoiceRepository.findOne({
            where: { id: updateStatusDto.invoiceId, tenantId },
            relations: ['lines', 'patient'],
        });
        if (!invoice) {
            throw new common_1.NotFoundException(`Invoice with ID ${updateStatusDto.invoiceId} not found`);
        }
        if (invoice.status !== entities_1.InvoiceStatus.DRAFT) {
            throw new Error('Only invoices in DRAFT status can be sent');
        }
        if (!invoice.lines || invoice.lines.length === 0) {
            throw new Error('Cannot send an invoice without lines');
        }
        invoice.status = entities_1.InvoiceStatus.SENT;
        const savedInvoice = await this.invoiceRepository.save(invoice);
        this.eventEmitter.emit('invoice.sent', new events_1.InvoiceSentEvent(savedInvoice));
        return savedInvoice;
    }
    async markPaid(tenantId, updateStatusDto) {
        const invoice = await this.invoiceRepository.findOne({
            where: { id: updateStatusDto.invoiceId, tenantId },
        });
        if (!invoice) {
            throw new common_1.NotFoundException(`Invoice with ID ${updateStatusDto.invoiceId} not found`);
        }
        invoice.status = entities_1.InvoiceStatus.PAID;
        return this.invoiceRepository.save(invoice);
    }
    async remindOverdue(tenantId) {
        const now = new Date();
        const overdueInvoices = await this.invoiceRepository.find({
            where: {
                tenantId,
                status: entities_1.InvoiceStatus.SENT,
                dueAt: (0, typeorm_2.LessThan)(now),
            },
            relations: ['patient'],
        });
        const updatedInvoices = overdueInvoices.map(invoice => {
            invoice.status = entities_1.InvoiceStatus.OVERDUE;
            return invoice;
        });
        if (updatedInvoices.length > 0) {
            await this.invoiceRepository.save(updatedInvoices);
        }
        return updatedInvoices;
    }
    async recalculateTotal(invoiceId) {
        const invoice = await this.invoiceRepository.findOne({
            where: { id: invoiceId },
            relations: ['lines'],
        });
        if (!invoice) {
            throw new common_1.NotFoundException(`Invoice with ID ${invoiceId} not found`);
        }
        let total = 0;
        if (invoice.lines && invoice.lines.length > 0) {
            for (const line of invoice.lines) {
                const lineTotal = line.qty * line.unitPrice;
                const thirdPartyAmount = lineTotal * (line.thirdPartyRate / 100);
                const taxAmount = (lineTotal - thirdPartyAmount) * (line.tax / 100);
                total += lineTotal - thirdPartyAmount + taxAmount;
            }
        }
        invoice.total = total;
        return this.invoiceRepository.save(invoice);
    }
    async findAll(tenantId) {
        return this.invoiceRepository.find({
            where: { tenantId },
            relations: ['patient', 'lines'],
            order: { issueDate: 'DESC' }
        });
    }
    async findOne(tenantId, id) {
        const invoice = await this.invoiceRepository.findOne({
            where: { id, tenantId },
            relations: ['patient', 'lines', 'payments']
        });
        if (!invoice) {
            throw new common_1.NotFoundException(`Facture avec l'ID ${id} non trouvée`);
        }
        return invoice;
    }
    async generatePdf(invoiceId, tenantId) {
        const invoice = await this.invoiceRepository.findOne({
            where: { id: invoiceId, tenantId },
            relations: ['patient', 'lines', 'payments'],
        });
        if (!invoice) {
            throw new common_1.NotFoundException(`Invoice with ID ${invoiceId} not found`);
        }
        const tenant = await this.tenantRepository.findOne({
            where: { id: tenantId },
        });
        const oldPdfPath = invoice.pdfPath;
        const oldQrPath = invoice.qr;
        const pdfInfo = await this.generatePdfFiles(invoice, tenant);
        if (oldPdfPath) {
            const pdfExists = await this.minioService.objectExists(this.bucketName, oldPdfPath);
            if (pdfExists) {
                await this.minioService.removeObject(this.bucketName, oldPdfPath);
            }
        }
        if (oldQrPath) {
            const qrExists = await this.minioService.objectExists(this.bucketName, oldQrPath);
            if (qrExists) {
                await this.minioService.removeObject(this.bucketName, oldQrPath);
            }
        }
        invoice.qr = pdfInfo.qrPath;
        invoice.pdfPath = pdfInfo.pdfPath;
        return this.invoiceRepository.save(invoice);
    }
    async generatePdfFiles(invoice, tenant) {
        const invoiceId = invoice.id;
        const tenantId = invoice.tenantId;
        const qrObjectName = `${tenantId}/invoices/qr/${invoiceId}.png`;
        const pdfObjectName = `${tenantId}/invoices/pdf/${invoiceId}.pdf`;
        const qrData = JSON.stringify({
            invoiceId: invoice.id,
            invoiceNumber: invoice.number,
            patientId: invoice.patientId,
            total: invoice.total,
            issueDate: invoice.issueDate,
            timestamp: new Date().toISOString(),
        });
        const qrBuffer = await QRCode.toBuffer(qrData, {
            type: 'png',
            width: 300,
            margin: 2,
        });
        await this.minioService.uploadBuffer(this.bucketName, qrObjectName, qrBuffer, 'image/png', {
            'X-Invoice-Id': invoiceId,
            'X-Tenant-Id': tenantId,
        });
        const pdfBuffer = await this.generatePdfBuffer(invoice, qrBuffer, tenant);
        await this.minioService.uploadBuffer(this.bucketName, pdfObjectName, pdfBuffer, 'application/pdf', {
            'X-Invoice-Id': invoiceId,
            'X-Tenant-Id': tenantId,
        });
        return {
            pdfPath: pdfObjectName,
            qrPath: qrObjectName,
        };
    }
    async generatePdfBuffer(invoice, qrBuffer, tenant = null) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 60,
                info: {
                    Title: `Facture ${invoice.number}`,
                    Author: tenant?.name || 'Système Médical',
                    Subject: `Facture pour ${invoice.patient?.firstName} ${invoice.patient?.lastName}`,
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
                .text('FACTURE', 60, 35, { align: 'center' });
            doc.fontSize(9)
                .font('Helvetica')
                .text(`N° ${invoice.number} - Généré le ${new Date().toLocaleString('fr-FR')}`, 60, 55, { align: 'center' });
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
                .text('INFORMATIONS PATIENT & FACTURE', 70, yPosition + 5);
            yPosition += 20;
            const patientName = `${invoice.patient?.firstName || ''} ${invoice.patient?.lastName || ''}`.trim();
            const issueDate = new Date(invoice.issueDate).toLocaleDateString('fr-FR');
            const dueDate = new Date(invoice.dueAt).toLocaleDateString('fr-FR');
            doc.fillColor(darkGray)
                .fontSize(9)
                .font('Helvetica')
                .text(`Patient: ${patientName}`, 70, yPosition)
                .text(`Émission: ${issueDate}`, 70, yPosition + 12);
            doc.text(`Statut: ${invoice.status}`, 350, yPosition)
                .text(`Échéance: ${dueDate}`, 350, yPosition + 12);
            yPosition += 30;
            doc.rect(60, yPosition, doc.page.width - 120, 20)
                .fill(accentColor);
            doc.fillColor('white')
                .fontSize(11)
                .font('Helvetica-Bold')
                .text('DÉTAILS DE LA FACTURE', 70, yPosition + 7);
            yPosition += 25;
            doc.rect(60, yPosition, doc.page.width - 120, 18)
                .fill(lightGray);
            doc.fillColor(darkGray)
                .fontSize(8)
                .font('Helvetica-Bold')
                .text('DESCRIPTION', 70, yPosition + 5, { width: 220 })
                .text('QTÉ', 300, yPosition + 5, { width: 40, align: 'center' })
                .text('P.U.', 350, yPosition + 5, { width: 70, align: 'right' })
                .text('MONTANT', 430, yPosition + 5, { width: 110, align: 'right' });
            yPosition += 20;
            const availableHeight = doc.page.height - yPosition - 140;
            const maxLineHeight = Math.min(30, Math.floor(availableHeight / invoice.lines.length) - 5);
            invoice.lines.forEach((line, index) => {
                const lineTotal = line.qty * line.unitPrice;
                const thirdPartyAmount = lineTotal * (line.thirdPartyRate / 100);
                const taxAmount = (lineTotal - thirdPartyAmount) * (line.tax / 100);
                const finalAmount = lineTotal - thirdPartyAmount + taxAmount;
                doc.rect(60, yPosition, doc.page.width - 120, maxLineHeight)
                    .stroke(secondaryColor)
                    .lineWidth(0.5);
                doc.fillColor(darkGray)
                    .fontSize(9)
                    .font('Helvetica')
                    .text(line.description, 70, yPosition + 3, { width: 220, height: maxLineHeight - 6 });
                doc.text(line.qty.toString(), 300, yPosition + 3, { width: 40, align: 'center' });
                doc.text(`${parseFloat(line.unitPrice.toString()).toLocaleString('fr-FR')}`, 350, yPosition + 3, { width: 70, align: 'right' });
                doc.text(`${finalAmount.toLocaleString('fr-FR')} FCFA`, 430, yPosition + 3, { width: 110, align: 'right' });
                if (line.thirdPartyRate > 0 || line.tax > 0) {
                    let additionalInfo = '';
                    if (line.thirdPartyRate > 0)
                        additionalInfo += `Tiers payant: ${line.thirdPartyRate}%`;
                    if (line.tax > 0) {
                        if (additionalInfo)
                            additionalInfo += ' | ';
                        additionalInfo += `Taxe: ${line.tax}%`;
                    }
                    doc.fontSize(7)
                        .fillColor(secondaryColor)
                        .text(additionalInfo, 70, yPosition + 15, { width: 220 });
                }
                yPosition += maxLineHeight + 2;
            });
            yPosition += 10;
            doc.rect(60, yPosition, doc.page.width - 120, 30)
                .fill(lightGray);
            doc.fillColor(darkGray)
                .fontSize(11)
                .font('Helvetica-Bold')
                .text('TOTAL À PAYER:', 70, yPosition + 10);
            doc.fontSize(14)
                .fillColor(primaryColor)
                .text(`${parseFloat(invoice.total.toString()).toLocaleString('fr-FR')} FCFA`, doc.page.width - 180, yPosition + 8, { width: 110, align: 'right' });
            yPosition += 35;
            if (invoice.notes) {
                doc.fillColor(darkGray)
                    .fontSize(8)
                    .font('Helvetica-Bold')
                    .text('Notes:', 60, yPosition);
                yPosition += 12;
                doc.fontSize(7)
                    .font('Helvetica')
                    .fillColor(secondaryColor)
                    .text(invoice.notes, 60, yPosition, {
                    width: doc.page.width - 120,
                    height: 30
                });
                yPosition += 35;
            }
            yPosition += 5;
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
                .text(`ID: ${invoice.id.substring(0, 8)}...`, 120, yPosition + 32);
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
                .text(`© ${new Date().getFullYear()} ${clinicName} - En cas de questions, veuillez contacter votre clinique`, 60, yPosition + 8);
            doc.end();
        });
    }
    async downloadPdf(invoiceId, tenantId) {
        const invoice = await this.invoiceRepository.findOne({
            where: { id: invoiceId, tenantId },
        });
        if (!invoice) {
            throw new common_1.NotFoundException(`Invoice with ID ${invoiceId} not found`);
        }
        if (!invoice.pdfPath) {
            const updatedInvoice = await this.generatePdf(invoiceId, tenantId);
            invoice.pdfPath = updatedInvoice.pdfPath;
        }
        const stream = await this.minioService.getObject(this.bucketName, invoice.pdfPath);
        return new Promise((resolve, reject) => {
            const chunks = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('end', () => resolve(Buffer.concat(chunks)));
            stream.on('error', reject);
        });
    }
};
exports.InvoicingService = InvoicingService;
exports.InvoicingService = InvoicingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Invoice)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.InvoiceLine)),
    __param(2, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        event_emitter_1.EventEmitter2,
        minio_service_1.MinioService])
], InvoicingService);
//# sourceMappingURL=invoicing.service.js.map