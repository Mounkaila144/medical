import { Injectable } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class MinioService {
  private readonly minioClient: Minio.Client;

  constructor() {
    // Configuration du client MinIO
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });
  }

  /**
   * Vérifie et crée un bucket s'il n'existe pas
   */
  async ensureBucketExists(bucketName: string): Promise<void> {
    const exists = await this.minioClient.bucketExists(bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(bucketName, 'us-east-1');
    }
  }

  /**
   * Upload un buffer vers MinIO
   */
  async uploadBuffer(
    bucketName: string,
    objectName: string,
    buffer: Buffer,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<void> {
    await this.ensureBucketExists(bucketName);
    
    await this.minioClient.putObject(
      bucketName,
      objectName,
      buffer,
      buffer.length,
      {
        'Content-Type': contentType,
        ...metadata,
      }
    );
  }

  /**
   * Upload un fichier vers MinIO
   */
  async uploadFile(
    bucketName: string,
    objectName: string,
    filePath: string,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<void> {
    await this.ensureBucketExists(bucketName);
    
    await this.minioClient.fPutObject(
      bucketName,
      objectName,
      filePath,
      {
        'Content-Type': contentType,
        ...metadata,
      }
    );
  }

  /**
   * Génère une URL pré-signée pour télécharger un fichier
   */
  async getPresignedUrl(
    bucketName: string,
    objectName: string,
    expiry: number = 7 * 24 * 60 * 60 // 7 jours par défaut
  ): Promise<string> {
    return this.minioClient.presignedGetObject(bucketName, objectName, expiry);
  }

  /**
   * Récupère un objet en tant que stream
   */
  async getObject(bucketName: string, objectName: string): Promise<NodeJS.ReadableStream> {
    return this.minioClient.getObject(bucketName, objectName);
  }

  /**
   * Supprime un objet
   */
  async removeObject(bucketName: string, objectName: string): Promise<void> {
    await this.minioClient.removeObject(bucketName, objectName);
  }

  /**
   * Vérifie si un objet existe
   */
  async objectExists(bucketName: string, objectName: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(bucketName, objectName);
      return true;
    } catch (error) {
      return false;
    }
  }
}