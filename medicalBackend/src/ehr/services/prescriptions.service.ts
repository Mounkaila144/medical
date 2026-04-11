import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription } from '../entities/prescription.entity';
import { PrescriptionItem } from '../entities/prescription-item.entity';
import { CreatePrescriptionDto } from '../dto/create-prescription.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrescriptionGeneratedEvent } from '../events/prescription-generated.event';
import { EncountersService } from './encounters.service';
import { MinioService } from '../../common/services/minio.service';
import { Tenant } from '../../auth/entities/tenant.entity';
import * as QRCode from 'qrcode';
import * as PDFDocument from 'pdfkit';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PrescriptionsService {
  private readonly bucketName = 'medical-prescriptions';

  constructor(
    @InjectRepository(Prescription)
    private prescriptionsRepository: Repository<Prescription>,
    @InjectRepository(PrescriptionItem)
    private prescriptionItemsRepository: Repository<PrescriptionItem>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private encountersService: EncountersService,
    private eventEmitter: EventEmitter2,
    private minioService: MinioService,
  ) {}

  async create(tenantId: string, createPrescriptionDto: CreatePrescriptionDto): Promise<Prescription> {
    // Vérifier que la consultation existe
    const encounter = await this.encountersService.findOne(createPrescriptionDto.encounterId);
    
    if (encounter.tenantId !== tenantId) {
      throw new NotFoundException('Consultation non trouvée');
    }

    // Créer la prescription
    const prescription = this.prescriptionsRepository.create({
      encounterId: createPrescriptionDto.encounterId,
      practitionerId: createPrescriptionDto.practitionerId,
      expiresAt: createPrescriptionDto.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Par défaut, 30 jours
    });
    
    const savedPrescription = await this.prescriptionsRepository.save(prescription);

    // Créer les items de prescription
    const items = createPrescriptionDto.items.map(item => 
      this.prescriptionItemsRepository.create({
        ...item,
        prescriptionId: savedPrescription.id,
      })
    );
    
    await this.prescriptionItemsRepository.save(items);
    
    // Générer le PDF et le QR code
    const pdfInfo = await this.generatePdf(savedPrescription, createPrescriptionDto, tenantId);
    
    // Mettre à jour la prescription avec les chemins des fichiers générés
    savedPrescription.pdfPath = pdfInfo.pdfPath;
    savedPrescription.qr = pdfInfo.qrPath;
    
    const updatedPrescription = await this.prescriptionsRepository.save(savedPrescription);
    
    // Émettre l'événement de génération de prescription
    this.eventEmitter.emit('prescription.generated', new PrescriptionGeneratedEvent(updatedPrescription));
    
    return updatedPrescription;
  }

  async findAll(tenantId: string): Promise<Prescription[]> {
    // Récupérer toutes les prescriptions pour le tenant donné avec les relations
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

  async findOne(id: string, tenantId?: string): Promise<Prescription> {
    if (tenantId) {
      const prescription = await this.prescriptionsRepository
        .createQueryBuilder('prescription')
        .innerJoin('prescription.encounter', 'encounter')
        .leftJoinAndSelect('prescription.encounter', 'encounterData')
        .leftJoinAndSelect('encounterData.patient', 'patient')
        .leftJoinAndSelect('prescription.practitioner', 'practitioner')
        .leftJoinAndSelect('prescription.items', 'items')
        .where('prescription.id = :id', { id })
        .andWhere('encounter.tenantId = :tenantId', { tenantId })
        .getOne();

      if (!prescription) {
        throw new NotFoundException(`Prescription avec ID ${id} non trouvée`);
      }
      return prescription;
    }

    const prescription = await this.prescriptionsRepository.findOne({
      where: { id },
      relations: ['encounter', 'practitioner', 'encounter.patient', 'items'],
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription avec ID ${id} non trouvée`);
    }

    return prescription;
  }

  private async generatePdf(
    prescription: Prescription, 
    createPrescriptionDto: CreatePrescriptionDto,
    tenantId: string
  ): Promise<{ pdfPath: string; qrPath: string }> {
    const prescriptionId = prescription.id;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Récupérer les informations de la clinique
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId }
    });
    
    // Noms des objets dans MinIO
    const qrObjectName = `${tenantId}/prescriptions/qr/${prescriptionId}.png`;
    const pdfObjectName = `${tenantId}/prescriptions/pdf/${prescriptionId}.pdf`;
    
    // Générer le QR code
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
    
    // Upload du QR code vers MinIO
    await this.minioService.uploadBuffer(
      this.bucketName,
      qrObjectName,
      qrBuffer,
      'image/png',
      {
        'X-Prescription-Id': prescriptionId,
        'X-Tenant-Id': tenantId,
      }
    );
    
    // Générer le PDF avec les informations de la clinique
    const pdfBuffer = await this.generatePdfBuffer(prescription, createPrescriptionDto, qrBuffer, tenant);
    
    // Upload du PDF vers MinIO
    await this.minioService.uploadBuffer(
      this.bucketName,
      pdfObjectName,
      pdfBuffer,
      'application/pdf',
      {
        'X-Prescription-Id': prescriptionId,
        'X-Tenant-Id': tenantId,
      }
    );
    
    return { 
      pdfPath: pdfObjectName, 
      qrPath: qrObjectName 
    };
  }

  async update(id: string, tenantId: string, updateData: Partial<CreatePrescriptionDto>): Promise<Prescription> {
    // Vérifier que la prescription existe et appartient au tenant
    const existingPrescription = await this.prescriptionsRepository
      .createQueryBuilder('prescription')
      .innerJoin('prescription.encounter', 'encounter')
      .where('prescription.id = :id', { id })
      .andWhere('encounter.tenantId = :tenantId', { tenantId })
      .getOne();

    if (!existingPrescription) {
      throw new NotFoundException('Prescription non trouvée');
    }

    // Sauvegarder les anciens chemins de fichiers pour les supprimer plus tard
    const oldPdfPath = existingPrescription.pdfPath;
    const oldQrPath = existingPrescription.qr;

    // Mettre à jour les champs principaux de la prescription
    if (updateData.encounterId) {
      // Vérifier que la nouvelle consultation existe et appartient au tenant
      const encounter = await this.encountersService.findOne(updateData.encounterId);
      if (encounter.tenantId !== tenantId) {
        throw new NotFoundException('Consultation non trouvée');
      }
      existingPrescription.encounterId = updateData.encounterId;
    }

    if (updateData.practitionerId) {
      existingPrescription.practitionerId = updateData.practitionerId;
    }

    if (updateData.expiresAt !== undefined) {
      existingPrescription.expiresAt = updateData.expiresAt;
    }

    // Sauvegarder les modifications de la prescription
    let updatedPrescription = await this.prescriptionsRepository.save(existingPrescription);

    // Variable pour savoir si on doit régénérer les fichiers
    let shouldRegenerateFiles = false;

    // Mettre à jour les items si fournis
    if (updateData.items) {
      // Supprimer les anciens items
      await this.prescriptionItemsRepository.delete({ prescriptionId: id });

      // Créer les nouveaux items
      const newItems = updateData.items.map(item => 
        this.prescriptionItemsRepository.create({
          ...item,
          prescriptionId: id,
        })
      );
      
      await this.prescriptionItemsRepository.save(newItems);
      shouldRegenerateFiles = true; // Les médicaments ont changé, il faut régénérer
    }

    // Régénérer PDF et QR code si les médicaments ont été modifiés
    if (shouldRegenerateFiles && updateData.items) {
      console.log('🔄 Début de la régénération des fichiers PDF/QR pour prescription:', id);
      try {
        // Supprimer les anciens fichiers de MinIO
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

        // Reconstruire un CreatePrescriptionDto complet pour la génération
        const fullPrescriptionData: CreatePrescriptionDto = {
          encounterId: updatedPrescription.encounterId,
          practitionerId: updatedPrescription.practitionerId,
          expiresAt: updatedPrescription.expiresAt,
          items: updateData.items!, // On sait qu'ils existent car on est dans cette condition
        };

        console.log('📝 Génération nouveau PDF avec', fullPrescriptionData.items.length, 'médicament(s)');

        // Régénérer le PDF et le QR code avec les nouveaux médicaments
        const pdfInfo = await this.generatePdf(updatedPrescription, fullPrescriptionData, tenantId);
        
        console.log('✅ Nouveaux fichiers générés:', { pdf: pdfInfo.pdfPath, qr: pdfInfo.qrPath });

        // Mettre à jour les chemins des fichiers
        updatedPrescription.pdfPath = pdfInfo.pdfPath;
        updatedPrescription.qr = pdfInfo.qrPath;
        
        updatedPrescription = await this.prescriptionsRepository.save(updatedPrescription);
        console.log('✅ Prescription mise à jour avec nouveaux chemins de fichiers');
      } catch (error) {
        console.error('❌ Erreur lors de la régénération des fichiers:', error);
        // Ne pas faire échouer la mise à jour si les fichiers ne peuvent pas être régénérés
      }
    }

    // Retourner la prescription mise à jour avec toutes les relations
    return this.findOne(id);
  }

  async regenerateFiles(id: string, tenantId: string): Promise<Prescription> {
    console.log(`🔄 Début de la régénération manuelle pour prescription: ${id}`);
    
    // Récupérer la prescription avec tous ses éléments
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
      throw new NotFoundException('Prescription non trouvée');
    }

    if (!prescription.items || prescription.items.length === 0) {
      throw new NotFoundException('Aucun médicament trouvé pour cette prescription');
    }

    console.log(`📋 Prescription trouvée avec ${prescription.items.length} médicament(s)`);

    // Supprimer les anciens fichiers s'ils existent
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
    } catch (error) {
      console.warn('⚠️ Erreur lors de la suppression des anciens fichiers:', error);
    }

    // Créer les données pour la génération
    const prescriptionData: CreatePrescriptionDto = {
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

    // Générer les nouveaux fichiers
    const pdfInfo = await this.generatePdf(prescription, prescriptionData, tenantId);

    // Mettre à jour les chemins dans la base de données
    prescription.pdfPath = pdfInfo.pdfPath;
    prescription.qr = pdfInfo.qrPath;

    const updatedPrescription = await this.prescriptionsRepository.save(prescription);

    console.log('✅ Fichiers régénérés avec succès:', { 
      pdf: pdfInfo.pdfPath, 
      qr: pdfInfo.qrPath 
    });

    return this.findOne(id);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    // Vérifier que la prescription existe et appartient au tenant
    const prescription = await this.prescriptionsRepository
      .createQueryBuilder('prescription')
      .innerJoin('prescription.encounter', 'encounter')
      .where('prescription.id = :id', { id })
      .andWhere('encounter.tenantId = :tenantId', { tenantId })
      .getOne();

    if (!prescription) {
      throw new NotFoundException('Prescription non trouvée');
    }

    // Supprimer les fichiers de MinIO si ils existent
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
    } catch (error) {
      console.error('Erreur lors de la suppression des fichiers MinIO:', error);
      // Ne pas échouer la suppression si les fichiers ne peuvent pas être supprimés
    }

    // Supprimer les items de prescription (cascade delete devrait s'en charger)
    await this.prescriptionItemsRepository.delete({ prescriptionId: id });

    // Supprimer la prescription
    await this.prescriptionsRepository.delete(id);
  }

  private async generatePdfBuffer(
    prescription: Prescription,
    createPrescriptionDto: CreatePrescriptionDto,
    qrBuffer: Buffer,
    tenant: Tenant | null = null
  ): Promise<Buffer> {
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
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Couleurs
      const primaryColor = '#2563eb'; // Bleu médical
      const secondaryColor = '#64748b'; // Gris
      const accentColor = '#059669'; // Vert
      const lightGray = '#f1f5f9';
      const darkGray = '#334155';

      // === EN-TÊTE AVEC LOGO ET INFORMATIONS CLINIQUE ===
      // Rectangle d'en-tête plus compact
      doc.rect(0, 0, doc.page.width, 80).fill(primaryColor);
      
      // Nom de la clinique (plus compact)
      const clinicName = tenant?.name || 'Clinique Médicale';
      doc.fillColor('white')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text(clinicName.toUpperCase(), 60, 15, { align: 'center' });
      
      // Titre principal
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('PRESCRIPTION MÉDICALE', 60, 35, { align: 'center' });
      
      // Date et heure de génération
      doc.fontSize(9)
         .font('Helvetica')
         .text(`Généré le ${new Date().toLocaleString('fr-FR')}`, 60, 55, { align: 'center' });

      // Réinitialiser la couleur pour le reste du document
      doc.fillColor(darkGray);

      // === INFORMATIONS PATIENT ET PRESCRIPTION ===
      let yPosition = 100;
      
      // Section patient et praticien combinée (plus compacte)
      doc.rect(60, yPosition, doc.page.width - 120, 50)
         .stroke(secondaryColor)
         .lineWidth(1);
      
      doc.rect(60, yPosition, doc.page.width - 120, 15)
         .fill(lightGray);
      
      // Titre section
      doc.fillColor(darkGray)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('INFORMATIONS PATIENT & PRATICIEN', 70, yPosition + 5);

      // Informations patient et praticien sur une ligne
      yPosition += 20;
      const patientName = `${prescription.encounter?.patient?.firstName || ''} ${prescription.encounter?.patient?.lastName || ''}`.trim();
      const patientMrn = prescription.encounter?.patient?.mrn || 'N/A';
      const practitionerName = `Dr. ${prescription.practitioner?.firstName || ''} ${prescription.practitioner?.lastName || ''}`.trim();
      
      doc.fillColor(darkGray)
         .fontSize(9)
         .font('Helvetica')
         .text(`Patient: ${patientName} (${patientMrn})`, 70, yPosition)
         .text(`Prescripteur: ${practitionerName}`, 70, yPosition + 12);

      // Dates compactes
      const prescriptionDate = new Date().toLocaleDateString('fr-FR');
      const expiryDate = prescription.expiresAt ? prescription.expiresAt.toLocaleDateString('fr-FR') : 'N/A';
      
      doc.text(`Date: ${prescriptionDate}`, 350, yPosition)
         .text(`Expire: ${expiryDate}`, 350, yPosition + 12);

      // === QMÉDICAMENTS PRESCRITS ===
      yPosition += 30;
      
      // Titre section médicaments (plus compact)
      doc.rect(60, yPosition, doc.page.width - 120, 20)
         .fill(accentColor);
      
      doc.fillColor('white')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('MÉDICAMENTS PRESCRITS', 70, yPosition + 7);

      yPosition += 25;
      doc.fillColor(darkGray);

      // Calculer l'espace disponible pour les médicaments
      const availableHeight = doc.page.height - yPosition - 120; // 120 pour le pied de page
      const maxMedicationHeight = Math.min(40, Math.floor(availableHeight / createPrescriptionDto.items.length) - 5);

      // Tableau des médicaments compact
      createPrescriptionDto.items.forEach((item, index) => {
        // Cadre pour chaque médicament (hauteur dynamique)
        doc.rect(60, yPosition, doc.page.width - 120, maxMedicationHeight)
           .stroke(secondaryColor)
           .lineWidth(0.5);

        // Numéro du médicament (plus petit)
        doc.rect(60, yPosition, 25, maxMedicationHeight)
           .fill(lightGray);
        
        doc.fillColor(primaryColor)
           .fontSize(12)
           .font('Helvetica-Bold')
           .text(`${index + 1}`, 65, yPosition + (maxMedicationHeight/2) - 6, { align: 'center', width: 15 });

        // Informations médicament (plus compactes)
        doc.fillColor(darkGray)
           .fontSize(10)
           .font('Helvetica-Bold')
           .text(item.medication, 90, yPosition + 3, { width: 200 });

        // Ligne 1: Posologie + Fréquence
        doc.fontSize(8)
           .font('Helvetica')
           .fillColor(secondaryColor)
           .text(`${item.dosage} - ${item.frequency}`, 90, yPosition + 15, { width: 200 });

        // Ligne 2: Durée + Instructions (si présentes)
        let additionalInfo = '';
        if (item.duration) additionalInfo += `Durée: ${item.duration}`;
        if (item.instructions) {
          if (additionalInfo) additionalInfo += ' | ';
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

      // === PIED DE PAGE AVEC QR CODE (compact) ===
      yPosition += 10;
      
      // Section QR Code et informations légales (plus petite)
      doc.rect(60, yPosition, doc.page.width - 120, 60)
         .stroke(secondaryColor)
         .lineWidth(0.5);

      // QR Code à gauche (plus petit)
      doc.image(qrBuffer, 70, yPosition + 10, {
        fit: [40, 40]
      });

      // Informations à droite du QR code (plus compactes)
      doc.fillColor(darkGray)
         .fontSize(8)
         .font('Helvetica-Bold')
         .text('Authentification QR', 120, yPosition + 10);

      doc.fontSize(7)
         .font('Helvetica')
         .fillColor(secondaryColor)
         .text('Code QR pour vérification', 120, yPosition + 22)
         .text(`ID: ${prescription.id.substring(0, 8)}...`, 120, yPosition + 32);

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
         .text(`© ${new Date().getFullYear()} ${clinicName} - En cas de questions, veuillez contacter votre praticien`, 60, yPosition + 8);

      // Finaliser le document
      doc.end();
    });
  }
} 