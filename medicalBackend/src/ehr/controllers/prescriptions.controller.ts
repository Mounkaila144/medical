import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { PrescriptionsService } from '../services/prescriptions.service';
import { CreatePrescriptionDto } from '../dto/create-prescription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUserRole } from '../../auth/entities/user.entity';
import { MinioService } from '../../common/services/minio.service';

@Controller('prescriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescriptionsController {
  private readonly bucketName = 'medical-prescriptions';
  
  constructor(
    private readonly prescriptionsService: PrescriptionsService,
    private readonly minioService: MinioService,
  ) {}

  @Post()
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE, AuthUserRole.PRACTITIONER)
  async create(@Body() createPrescriptionDto: CreatePrescriptionDto, @Req() req) {
    return this.prescriptionsService.create(req.user.tenantId, createPrescriptionDto);
  }

  @Get()
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE, AuthUserRole.PRACTITIONER)
  async findAll(@Req() req) {
    return this.prescriptionsService.findAll(req.user.tenantId);
  }

  @Get(':id')
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE, AuthUserRole.PRACTITIONER)
  async findOne(@Param('id') id: string, @Req() req) {
    return this.prescriptionsService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE, AuthUserRole.PRACTITIONER)
  async update(
    @Param('id') id: string,
    @Body() updatePrescriptionDto: Partial<CreatePrescriptionDto>,
    @Req() req
  ) {
    return this.prescriptionsService.update(id, req.user.tenantId, updatePrescriptionDto);
  }

  @Post(':id/regenerate-files')
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE, AuthUserRole.PRACTITIONER)
  async regenerateFiles(@Param('id') id: string, @Req() req) {
    console.log(`🔄 Demande de régénération manuelle des fichiers pour prescription: ${id}`);
    return this.prescriptionsService.regenerateFiles(id, req.user.tenantId);
  }

  @Get(':id/qr-image')
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE, AuthUserRole.PRACTITIONER)
  async getQrImage(
    @Param('id') id: string,
    @Req() req,
    @Res() res: Response,
  ) {
    // Vérifier que la prescription existe
    let prescription = await this.prescriptionsService.findOne(id);
    
    if (!prescription.qr) {
      console.log('🔄 QR code manquant, tentative de régénération automatique...');
      try {
        prescription = await this.prescriptionsService.regenerateFiles(id, req.user.tenantId);
        if (!prescription.qr) {
          throw new NotFoundException('QR code non trouvé pour cette prescription');
        }
      } catch (error) {
        console.error('❌ Échec de la régénération automatique du QR:', error);
        throw new NotFoundException('QR code non trouvé pour cette prescription');
      }
    }
    
    try {
      // Vérifier que l'objet existe dans MinIO
      let exists = await this.minioService.objectExists(this.bucketName, prescription.qr);
      
      if (!exists) {
        console.log('🔄 QR code absent de MinIO, tentative de régénération automatique...');
        try {
          prescription = await this.prescriptionsService.regenerateFiles(id, req.user.tenantId);
          exists = await this.minioService.objectExists(this.bucketName, prescription.qr);
          
          if (!exists) {
            throw new Error('Régénération échouée');
          }
          console.log('✅ QR code régénéré automatiquement');
        } catch (regenError) {
          console.error('❌ Échec de la régénération automatique du QR:', regenError);
          throw new NotFoundException('QR code non trouvé dans le stockage');
        }
      }
      
      // Streamer l'image depuis MinIO
      const stream = await this.minioService.getObject(this.bucketName, prescription.qr);
      
      // Configurer les headers de réponse pour affichage direct
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache 24h
      
      // Pipe le stream vers la réponse
      stream.pipe(res);
    } catch (error) {
      console.error('Error serving QR image:', error);
      throw new NotFoundException('Erreur lors de l\'affichage du QR code');
    }
  }

  @Get(':id/download/:type')
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE, AuthUserRole.PRACTITIONER)
  async downloadFile(
    @Param('id') id: string,
    @Param('type') type: string,
    @Req() req,
    @Res() res: Response,
  ) {
    console.log(`📥 Demande de téléchargement - ID: ${id}, Type: ${type}`);
    
    // Vérifier que la prescription existe
    let prescription = await this.prescriptionsService.findOne(id);
    console.log('📋 Prescription trouvée:', { id: prescription.id, pdfPath: prescription.pdfPath, qr: prescription.qr });
    
    let objectName: string;
    let contentType: string;
    let filename: string;
    
    if (type === 'pdf') {
      objectName = prescription.pdfPath;
      contentType = 'application/pdf';
      filename = `prescription-${id}.pdf`;
    } else if (type === 'qr') {
      objectName = prescription.qr;
      contentType = 'image/png';
      filename = `prescription-qr-${id}.png`;
    } else {
      console.error('❌ Type de fichier non supporté:', type);
      throw new NotFoundException('Type de fichier non supporté');
    }
    
    if (!objectName) {
      console.error('❌ Chemin du fichier vide pour le type:', type);
      console.log('🔄 Tentative de régénération automatique des fichiers...');
      
      try {
        // Régénérer automatiquement les fichiers manquants
        prescription = await this.prescriptionsService.regenerateFiles(id, req.user.tenantId);
        
        // Mettre à jour l'objectName avec le nouveau chemin
        if (type === 'pdf') {
          objectName = prescription.pdfPath;
        } else if (type === 'qr') {
          objectName = prescription.qr;
        }
        
        if (!objectName) {
          throw new NotFoundException('Impossible de régénérer le fichier');
        }
        
        console.log(`✅ Fichier régénéré automatiquement: ${objectName}`);
      } catch (regenError) {
        console.error('❌ Échec de la régénération automatique:', regenError);
        throw new NotFoundException('Fichier non trouvé et régénération échouée');
      }
    }
    
    console.log(`🔍 Recherche du fichier dans MinIO: ${objectName}`);
    
    try {
      // Vérifier que l'objet existe dans MinIO
      let exists = await this.minioService.objectExists(this.bucketName, objectName);
      console.log(`📁 Fichier existe dans MinIO: ${exists}`);
      
      // Si le fichier n'existe pas, tenter une régénération automatique
      if (!exists) {
        console.log('🔄 Fichier absent, tentative de régénération automatique...');
        
        try {
          // Régénérer automatiquement les fichiers
          prescription = await this.prescriptionsService.regenerateFiles(id, req.user.tenantId);
          
          // Mettre à jour l'objectName avec le nouveau chemin
          if (type === 'pdf') {
            objectName = prescription.pdfPath;
          } else if (type === 'qr') {
            objectName = prescription.qr;
          }
          
          // Vérifier à nouveau l'existence
          exists = await this.minioService.objectExists(this.bucketName, objectName);
          console.log(`📁 Fichier régénéré existe maintenant: ${exists}`);
          
          if (!exists) {
            throw new Error('Régénération échouée');
          }
          
          console.log('✅ Fichier régénéré automatiquement avec succès');
        } catch (regenError) {
          console.error('❌ Échec de la régénération automatique:', regenError);
          throw new NotFoundException('Fichier non trouvé dans le stockage et régénération échouée');
        }
      }
      
      // Streamer le fichier depuis MinIO
      const stream = await this.minioService.getObject(this.bucketName, objectName);
      console.log('✅ Stream MinIO obtenu, envoi du fichier...');
      
      // Configurer les headers de réponse
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Pipe le stream vers la réponse
      stream.pipe(res);
    } catch (error) {
      console.error('❌ Erreur détaillée lors du téléchargement:', error);
      throw new NotFoundException('Erreur lors du téléchargement du fichier');
    }
  }

  @Delete(':id')
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE, AuthUserRole.PRACTITIONER)
  async delete(@Param('id') id: string, @Req() req) {
    await this.prescriptionsService.delete(id, req.user.tenantId);
    return { message: 'Prescription supprimée avec succès' };
  }
} 