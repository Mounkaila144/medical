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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinioService = void 0;
const common_1 = require("@nestjs/common");
const Minio = require("minio");
let MinioService = class MinioService {
    minioClient;
    constructor() {
        this.minioClient = new Minio.Client({
            endPoint: process.env.MINIO_ENDPOINT || 'localhost',
            port: parseInt(process.env.MINIO_PORT || '9000'),
            useSSL: process.env.MINIO_USE_SSL === 'true',
            accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
            secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
        });
    }
    async ensureBucketExists(bucketName) {
        const exists = await this.minioClient.bucketExists(bucketName);
        if (!exists) {
            await this.minioClient.makeBucket(bucketName, 'us-east-1');
        }
    }
    async uploadBuffer(bucketName, objectName, buffer, contentType, metadata) {
        await this.ensureBucketExists(bucketName);
        await this.minioClient.putObject(bucketName, objectName, buffer, buffer.length, {
            'Content-Type': contentType,
            ...metadata,
        });
    }
    async uploadFile(bucketName, objectName, filePath, contentType, metadata) {
        await this.ensureBucketExists(bucketName);
        await this.minioClient.fPutObject(bucketName, objectName, filePath, {
            'Content-Type': contentType,
            ...metadata,
        });
    }
    async getPresignedUrl(bucketName, objectName, expiry = 7 * 24 * 60 * 60) {
        return this.minioClient.presignedGetObject(bucketName, objectName, expiry);
    }
    async getObject(bucketName, objectName) {
        return this.minioClient.getObject(bucketName, objectName);
    }
    async removeObject(bucketName, objectName) {
        await this.minioClient.removeObject(bucketName, objectName);
    }
    async objectExists(bucketName, objectName) {
        try {
            await this.minioClient.statObject(bucketName, objectName);
            return true;
        }
        catch (error) {
            return false;
        }
    }
};
exports.MinioService = MinioService;
exports.MinioService = MinioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MinioService);
//# sourceMappingURL=minio.service.js.map