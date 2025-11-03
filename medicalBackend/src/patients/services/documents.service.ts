import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScannedDocument } from '../entities/scanned-document.entity';
import { CreateDocumentDto } from '../dto/create-document.dto';
import { PatientsService } from './patients.service';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocumentsService {
  private readonly minioClient: Minio.Client;
  private readonly bucketName = 'patient-documents';

  constructor(
    @InjectRepository(ScannedDocument)
    private documentsRepository: Repository<ScannedDocument>,
    private patientsService: PatientsService,
    @Inject('RABBITMQ_SERVICE')
    private rabbitmqClient: ClientProxy,
  ) {
    // Configuration du client MinIO
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });

    // Vérifier et créer le bucket si nécessaire
    this.initBucket().catch(err => {
      console.error('MinIO initialization error:', err);
    });
  }

  private async initBucket(): Promise<void> {
    const exists = await this.minioClient.bucketExists(this.bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
    }
  }

  async upload(
    file: Express.Multer.File,
    createDocumentDto: CreateDocumentDto,
    clinicId: string,
  ): Promise<ScannedDocument> {
    // Vérifier que le patient existe et appartient à la clinique
    const patient = await this.patientsService.findOne(
      createDocumentDto.patientId,
      clinicId,
    );

    // Générer un nom de fichier unique
    const fileExtension = file.originalname.split('.').pop();
    const objectName = `${clinicId}/${patient.id}/${uuidv4()}.${fileExtension}`;

    try {
      // Télécharger le fichier vers MinIO
      await this.minioClient.putObject(
        this.bucketName,
        objectName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
          'X-Patient-Id': patient.id,
          'X-Clinic-Id': clinicId,
        },
      );

      // Créer l'entrée dans la base de données
      const document = this.documentsRepository.create({
        ...createDocumentDto,
        path: objectName,
        uploadedAt: new Date(),
      });

      const savedDocument = await this.documentsRepository.save(document);

      // Publier un événement document.uploaded
      this.rabbitmqClient.emit('document.uploaded', {
        document: savedDocument,
        patientId: patient.id,
        clinicId: clinicId,
        timestamp: new Date(),
      });

      return savedDocument;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to upload document: ${error.message}`,
      );
    }
  }

  async list(patientId: string, clinicId: string): Promise<ScannedDocument[]> {
    // Vérifier que le patient existe et appartient à la clinique
    await this.patientsService.findOne(patientId, clinicId);

    return this.documentsRepository.find({
      where: { patientId },
      order: { uploadedAt: 'DESC' },
    });
  }

  async delete(id: string, clinicId: string): Promise<void> {
    const document = await this.documentsRepository.findOne({
      where: { id },
      relations: ['patient'],
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    // Vérifier que le patient appartient à la clinique (sécurité multi-tenant)
    if (document.patient.clinicId !== clinicId) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    try {
      // Supprimer le fichier de MinIO
      await this.minioClient.removeObject(this.bucketName, document.path);

      // Supprimer l'entrée de la base de données
      await this.documentsRepository.remove(document);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete document: ${error.message}`,
      );
    }
  }
} 