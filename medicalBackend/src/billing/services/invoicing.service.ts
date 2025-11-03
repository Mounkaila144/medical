import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Invoice, InvoiceStatus, InvoiceLine } from '../entities';
import {
  CreateInvoiceDto,
  AddInvoiceLineDto,
  UpdateInvoiceStatusDto
} from '../dto';
import { InvoiceSentEvent } from '../events';
import { MinioService } from '../../common/services/minio.service';
import { Tenant } from '../../auth/entities/tenant.entity';
import * as PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';

@Injectable()
export class InvoicingService {
  private readonly bucketName = 'medical-invoices';

  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceLine)
    private invoiceLineRepository: Repository<InvoiceLine>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private eventEmitter: EventEmitter2,
    private minioService: MinioService,
  ) {}

  async createDraft(tenantId: string, createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const invoice = this.invoiceRepository.create({
      tenantId,
      patientId: createInvoiceDto.patientId,
      number: createInvoiceDto.number || `INV-${Date.now()}`,
      status: InvoiceStatus.DRAFT,
      dueAt: createInvoiceDto.dueAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours par défaut
      encounterId: createInvoiceDto.encounterId,
      issueDate: createInvoiceDto.issueDate || new Date(),
      billingAddress: createInvoiceDto.billingAddress,
      notes: createInvoiceDto.notes,
    });

    return this.invoiceRepository.save(invoice);
  }

  async addLine(tenantId: string, addLineDto: AddInvoiceLineDto): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: addLineDto.invoiceId, tenantId },
      relations: ['lines'],
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${addLineDto.invoiceId} not found`);
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
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

    // Recalculer le total de la facture
    return this.recalculateTotal(invoice.id);
  }

  async send(tenantId: string, updateStatusDto: UpdateInvoiceStatusDto): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: updateStatusDto.invoiceId, tenantId },
      relations: ['lines', 'patient'],
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${updateStatusDto.invoiceId} not found`);
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new Error('Only invoices in DRAFT status can be sent');
    }

    if (!invoice.lines || invoice.lines.length === 0) {
      throw new Error('Cannot send an invoice without lines');
    }

    invoice.status = InvoiceStatus.SENT;
    const savedInvoice = await this.invoiceRepository.save(invoice);

    // Émettre l'événement
    this.eventEmitter.emit('invoice.sent', new InvoiceSentEvent(savedInvoice));

    return savedInvoice;
  }

  async markPaid(tenantId: string, updateStatusDto: UpdateInvoiceStatusDto): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: updateStatusDto.invoiceId, tenantId },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${updateStatusDto.invoiceId} not found`);
    }

    invoice.status = InvoiceStatus.PAID;
    return this.invoiceRepository.save(invoice);
  }

  async remindOverdue(tenantId: string): Promise<Invoice[]> {
    const now = new Date();
    const overdueInvoices = await this.invoiceRepository.find({
      where: {
        tenantId,
        status: InvoiceStatus.SENT,
        dueAt: LessThan(now),
      },
      relations: ['patient'],
    });

    const updatedInvoices = overdueInvoices.map(invoice => {
      invoice.status = InvoiceStatus.OVERDUE;
      return invoice;
    });

    if (updatedInvoices.length > 0) {
      await this.invoiceRepository.save(updatedInvoices);
    }

    return updatedInvoices;
  }

  private async recalculateTotal(invoiceId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
      relations: ['lines'],
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
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

  async findAll(tenantId: string): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      where: { tenantId },
      relations: ['patient', 'lines'],
      order: { issueDate: 'DESC' }
    });
  }

  async findOne(tenantId: string, id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id, tenantId },
      relations: ['patient', 'lines', 'payments']
    });

    if (!invoice) {
      throw new NotFoundException(`Facture avec l'ID ${id} non trouvée`);
    }

    return invoice;
  }

  /**
   * Generate PDF for invoice
   */
  async generatePdf(invoiceId: string, tenantId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId, tenantId },
      relations: ['patient', 'lines', 'payments'],
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }

    // Get tenant information
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    // Save old paths for deletion
    const oldPdfPath = invoice.pdfPath;
    const oldQrPath = invoice.qr;

    // Generate QR code and PDF
    const pdfInfo = await this.generatePdfFiles(invoice, tenant);

    // Delete old files if they exist
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

    // Update invoice with file paths
    invoice.qr = pdfInfo.qrPath;
    invoice.pdfPath = pdfInfo.pdfPath;

    return this.invoiceRepository.save(invoice);
  }

  /**
   * Generate and upload PDF and QR code files
   */
  private async generatePdfFiles(
    invoice: Invoice,
    tenant: Tenant | null
  ): Promise<{ pdfPath: string; qrPath: string }> {
    const invoiceId = invoice.id;
    const tenantId = invoice.tenantId;

    // Object names in MinIO
    const qrObjectName = `${tenantId}/invoices/qr/${invoiceId}.png`;
    const pdfObjectName = `${tenantId}/invoices/pdf/${invoiceId}.pdf`;

    // Generate QR code
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

    // Upload QR code to MinIO
    await this.minioService.uploadBuffer(
      this.bucketName,
      qrObjectName,
      qrBuffer,
      'image/png',
      {
        'X-Invoice-Id': invoiceId,
        'X-Tenant-Id': tenantId,
      }
    );

    // Generate PDF with clinic information
    const pdfBuffer = await this.generatePdfBuffer(invoice, qrBuffer, tenant);

    // Upload PDF to MinIO
    await this.minioService.uploadBuffer(
      this.bucketName,
      pdfObjectName,
      pdfBuffer,
      'application/pdf',
      {
        'X-Invoice-Id': invoiceId,
        'X-Tenant-Id': tenantId,
      }
    );

    return {
      pdfPath: pdfObjectName,
      qrPath: qrObjectName,
    };
  }

  /**
   * Generate PDF buffer for invoice
   */
  private async generatePdfBuffer(
    invoice: Invoice,
    qrBuffer: Buffer,
    tenant: Tenant | null = null
  ): Promise<Buffer> {
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

      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Colors
      const primaryColor = '#2563eb'; // Bleu médical
      const secondaryColor = '#64748b'; // Gris
      const accentColor = '#059669'; // Vert
      const lightGray = '#f1f5f9';
      const darkGray = '#334155';

      // === EN-TÊTE AVEC LOGO ET INFORMATIONS CLINIQUE ===
      // Rectangle d'en-tête compact
      doc.rect(0, 0, doc.page.width, 80).fill(primaryColor);

      const clinicName = tenant?.name || 'Clinique Médicale';
      doc.fillColor('white')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text(clinicName.toUpperCase(), 60, 15, { align: 'center' });

      // Titre principal
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('FACTURE', 60, 35, { align: 'center' });

      // Numéro de facture et date
      doc.fontSize(9)
         .font('Helvetica')
         .text(`N° ${invoice.number} - Généré le ${new Date().toLocaleString('fr-FR')}`, 60, 55, { align: 'center' });

      // Réinitialiser la couleur
      doc.fillColor(darkGray);

      // === INFORMATIONS PATIENT ET FACTURE ===
      let yPosition = 100;

      // Section patient et dates combinée (plus compacte)
      doc.rect(60, yPosition, doc.page.width - 120, 50)
         .stroke(secondaryColor)
         .lineWidth(1);

      doc.rect(60, yPosition, doc.page.width - 120, 15)
         .fill(lightGray);

      // Titre section
      doc.fillColor(darkGray)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('INFORMATIONS PATIENT & FACTURE', 70, yPosition + 5);

      // Informations patient et dates
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

      // === TABLEAU DES LIGNES DE FACTURE ===
      yPosition += 30;

      // Titre section lignes (plus compact)
      doc.rect(60, yPosition, doc.page.width - 120, 20)
         .fill(accentColor);

      doc.fillColor('white')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('DÉTAILS DE LA FACTURE', 70, yPosition + 7);

      yPosition += 25;

      // En-tête du tableau
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

      // Calculer l'espace disponible pour les lignes
      const availableHeight = doc.page.height - yPosition - 140; // 140 pour le pied de page et totaux
      const maxLineHeight = Math.min(30, Math.floor(availableHeight / invoice.lines.length) - 5);

      // Lignes de facture compactes
      invoice.lines.forEach((line, index) => {
        const lineTotal = line.qty * line.unitPrice;
        const thirdPartyAmount = lineTotal * (line.thirdPartyRate / 100);
        const taxAmount = (lineTotal - thirdPartyAmount) * (line.tax / 100);
        const finalAmount = lineTotal - thirdPartyAmount + taxAmount;

        // Cadre pour chaque ligne
        doc.rect(60, yPosition, doc.page.width - 120, maxLineHeight)
           .stroke(secondaryColor)
           .lineWidth(0.5);

        // Description
        doc.fillColor(darkGray)
           .fontSize(9)
           .font('Helvetica')
           .text(line.description, 70, yPosition + 3, { width: 220, height: maxLineHeight - 6 });

        // Quantité
        doc.text(line.qty.toString(), 300, yPosition + 3, { width: 40, align: 'center' });

        // Prix unitaire
        doc.text(`${parseFloat(line.unitPrice.toString()).toLocaleString('fr-FR')}`, 350, yPosition + 3, { width: 70, align: 'right' });

        // Montant
        doc.text(`${finalAmount.toLocaleString('fr-FR')} FCFA`, 430, yPosition + 3, { width: 110, align: 'right' });

        // Informations supplémentaires (tiers payant, taxe)
        if (line.thirdPartyRate > 0 || line.tax > 0) {
          let additionalInfo = '';
          if (line.thirdPartyRate > 0) additionalInfo += `Tiers payant: ${line.thirdPartyRate}%`;
          if (line.tax > 0) {
            if (additionalInfo) additionalInfo += ' | ';
            additionalInfo += `Taxe: ${line.tax}%`;
          }
          doc.fontSize(7)
             .fillColor(secondaryColor)
             .text(additionalInfo, 70, yPosition + 15, { width: 220 });
        }

        yPosition += maxLineHeight + 2;
      });

      // === TOTAUX ===
      yPosition += 10;

      doc.rect(60, yPosition, doc.page.width - 120, 30)
         .fill(lightGray);

      doc.fillColor(darkGray)
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('TOTAL À PAYER:', 70, yPosition + 10);

      doc.fontSize(14)
         .fillColor(primaryColor)
         .text(`${parseFloat(invoice.total.toString()).toLocaleString('fr-FR')} FCFA`,
               doc.page.width - 180, yPosition + 8, { width: 110, align: 'right' });

      // === NOTES (si présentes) ===
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

      // === PIED DE PAGE AVEC QR CODE (compact) ===
      yPosition += 5;

      // Section QR Code et informations légales (plus petite)
      doc.rect(60, yPosition, doc.page.width - 120, 60)
         .stroke(secondaryColor)
         .lineWidth(0.5);

      // QR Code à gauche (plus petit)
      doc.image(qrBuffer, 70, yPosition + 10, {
        fit: [40, 40]
      });

      // Informations à droite du QR code
      doc.fillColor(darkGray)
         .fontSize(8)
         .font('Helvetica-Bold')
         .text('Authentification QR', 120, yPosition + 10);

      doc.fontSize(7)
         .font('Helvetica')
         .fillColor(secondaryColor)
         .text('Code QR pour vérification', 120, yPosition + 22)
         .text(`ID: ${invoice.id.substring(0, 8)}...`, 120, yPosition + 32);

      // Informations de la clinique à droite
      doc.fontSize(8)
         .fillColor(darkGray)
         .text(`${clinicName}`, 300, yPosition + 10)
         .fontSize(7)
         .fillColor(secondaryColor)
         .text('Document confidentiel', 300, yPosition + 22)
         .text(`${new Date().toLocaleDateString('fr-FR')}`, 300, yPosition + 32);

      // === PIED DE PAGE FINAL (très compact) ===
      yPosition += 70;

      doc.rect(0, yPosition, doc.page.width, 20)
         .fill(lightGray);

      doc.fillColor(secondaryColor)
         .fontSize(7)
         .font('Helvetica')
         .text(`© ${new Date().getFullYear()} ${clinicName} - En cas de questions, veuillez contacter votre clinique`,
               60, yPosition + 8);

      // Finaliser le document
      doc.end();
    });
  }

  /**
   * Download invoice PDF
   */
  async downloadPdf(invoiceId: string, tenantId: string): Promise<Buffer> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId, tenantId },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }

    // If PDF doesn't exist, generate it
    if (!invoice.pdfPath) {
      const updatedInvoice = await this.generatePdf(invoiceId, tenantId);
      invoice.pdfPath = updatedInvoice.pdfPath;
    }

    const stream = await this.minioService.getObject(this.bucketName, invoice.pdfPath);

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }
} 