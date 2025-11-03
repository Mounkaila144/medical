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
exports.PrescriptionsController = void 0;
const common_1 = require("@nestjs/common");
const prescriptions_service_1 = require("../services/prescriptions.service");
const create_prescription_dto_1 = require("../dto/create-prescription.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../../auth/entities/user.entity");
const minio_service_1 = require("../../common/services/minio.service");
let PrescriptionsController = class PrescriptionsController {
    prescriptionsService;
    minioService;
    bucketName = 'medical-prescriptions';
    constructor(prescriptionsService, minioService) {
        this.prescriptionsService = prescriptionsService;
        this.minioService = minioService;
    }
    async create(createPrescriptionDto, req) {
        return this.prescriptionsService.create(req.user.tenantId, createPrescriptionDto);
    }
    async findAll(req) {
        return this.prescriptionsService.findAll(req.user.tenantId);
    }
    async findOne(id) {
        return this.prescriptionsService.findOne(id);
    }
    async update(id, updatePrescriptionDto, req) {
        return this.prescriptionsService.update(id, req.user.tenantId, updatePrescriptionDto);
    }
    async regenerateFiles(id, req) {
        console.log(`🔄 Demande de régénération manuelle des fichiers pour prescription: ${id}`);
        return this.prescriptionsService.regenerateFiles(id, req.user.tenantId);
    }
    async getQrImage(id, req, res) {
        let prescription = await this.prescriptionsService.findOne(id);
        if (!prescription.qr) {
            console.log('🔄 QR code manquant, tentative de régénération automatique...');
            try {
                prescription = await this.prescriptionsService.regenerateFiles(id, req.user.tenantId);
                if (!prescription.qr) {
                    throw new common_1.NotFoundException('QR code non trouvé pour cette prescription');
                }
            }
            catch (error) {
                console.error('❌ Échec de la régénération automatique du QR:', error);
                throw new common_1.NotFoundException('QR code non trouvé pour cette prescription');
            }
        }
        try {
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
                }
                catch (regenError) {
                    console.error('❌ Échec de la régénération automatique du QR:', regenError);
                    throw new common_1.NotFoundException('QR code non trouvé dans le stockage');
                }
            }
            const stream = await this.minioService.getObject(this.bucketName, prescription.qr);
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Cache-Control', 'public, max-age=86400');
            stream.pipe(res);
        }
        catch (error) {
            console.error('Error serving QR image:', error);
            throw new common_1.NotFoundException('Erreur lors de l\'affichage du QR code');
        }
    }
    async downloadFile(id, type, req, res) {
        console.log(`📥 Demande de téléchargement - ID: ${id}, Type: ${type}`);
        let prescription = await this.prescriptionsService.findOne(id);
        console.log('📋 Prescription trouvée:', { id: prescription.id, pdfPath: prescription.pdfPath, qr: prescription.qr });
        let objectName;
        let contentType;
        let filename;
        if (type === 'pdf') {
            objectName = prescription.pdfPath;
            contentType = 'application/pdf';
            filename = `prescription-${id}.pdf`;
        }
        else if (type === 'qr') {
            objectName = prescription.qr;
            contentType = 'image/png';
            filename = `prescription-qr-${id}.png`;
        }
        else {
            console.error('❌ Type de fichier non supporté:', type);
            throw new common_1.NotFoundException('Type de fichier non supporté');
        }
        if (!objectName) {
            console.error('❌ Chemin du fichier vide pour le type:', type);
            console.log('🔄 Tentative de régénération automatique des fichiers...');
            try {
                prescription = await this.prescriptionsService.regenerateFiles(id, req.user.tenantId);
                if (type === 'pdf') {
                    objectName = prescription.pdfPath;
                }
                else if (type === 'qr') {
                    objectName = prescription.qr;
                }
                if (!objectName) {
                    throw new common_1.NotFoundException('Impossible de régénérer le fichier');
                }
                console.log(`✅ Fichier régénéré automatiquement: ${objectName}`);
            }
            catch (regenError) {
                console.error('❌ Échec de la régénération automatique:', regenError);
                throw new common_1.NotFoundException('Fichier non trouvé et régénération échouée');
            }
        }
        console.log(`🔍 Recherche du fichier dans MinIO: ${objectName}`);
        try {
            let exists = await this.minioService.objectExists(this.bucketName, objectName);
            console.log(`📁 Fichier existe dans MinIO: ${exists}`);
            if (!exists) {
                console.log('🔄 Fichier absent, tentative de régénération automatique...');
                try {
                    prescription = await this.prescriptionsService.regenerateFiles(id, req.user.tenantId);
                    if (type === 'pdf') {
                        objectName = prescription.pdfPath;
                    }
                    else if (type === 'qr') {
                        objectName = prescription.qr;
                    }
                    exists = await this.minioService.objectExists(this.bucketName, objectName);
                    console.log(`📁 Fichier régénéré existe maintenant: ${exists}`);
                    if (!exists) {
                        throw new Error('Régénération échouée');
                    }
                    console.log('✅ Fichier régénéré automatiquement avec succès');
                }
                catch (regenError) {
                    console.error('❌ Échec de la régénération automatique:', regenError);
                    throw new common_1.NotFoundException('Fichier non trouvé dans le stockage et régénération échouée');
                }
            }
            const stream = await this.minioService.getObject(this.bucketName, objectName);
            console.log('✅ Stream MinIO obtenu, envoi du fichier...');
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            stream.pipe(res);
        }
        catch (error) {
            console.error('❌ Erreur détaillée lors du téléchargement:', error);
            throw new common_1.NotFoundException('Erreur lors du téléchargement du fichier');
        }
    }
    async delete(id, req) {
        await this.prescriptionsService.delete(id, req.user.tenantId);
        return { message: 'Prescription supprimée avec succès' };
    }
};
exports.PrescriptionsController = PrescriptionsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_prescription_dto_1.CreatePrescriptionDto, Object]),
    __metadata("design:returntype", Promise)
], PrescriptionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PrescriptionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PrescriptionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PrescriptionsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/regenerate-files'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PrescriptionsController.prototype, "regenerateFiles", null);
__decorate([
    (0, common_1.Get)(':id/qr-image'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PrescriptionsController.prototype, "getQrImage", null);
__decorate([
    (0, common_1.Get)(':id/download/:type'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('type')),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], PrescriptionsController.prototype, "downloadFile", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PrescriptionsController.prototype, "delete", null);
exports.PrescriptionsController = PrescriptionsController = __decorate([
    (0, common_1.Controller)('prescriptions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [prescriptions_service_1.PrescriptionsService,
        minio_service_1.MinioService])
], PrescriptionsController);
//# sourceMappingURL=prescriptions.controller.js.map