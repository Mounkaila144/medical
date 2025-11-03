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
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const documents_service_1 = require("../services/documents.service");
const create_document_dto_1 = require("../dto/create-document.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_guard_2 = require("../../auth/guards/roles.guard");
const user_entity_1 = require("../../auth/entities/user.entity");
let DocumentsController = class DocumentsController {
    documentsService;
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    async upload(file, createDocumentDto, req) {
        if (!file) {
            throw new common_1.BadRequestException('Aucun fichier n\'a été téléchargé');
        }
        if (createDocumentDto.tags && typeof createDocumentDto.tags === 'string') {
            createDocumentDto.tags = createDocumentDto.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0);
        }
        const tenantId = req.user.tenantId;
        return this.documentsService.upload(file, createDocumentDto, tenantId);
    }
    async listByPatient(patientId, req) {
        const tenantId = req.user.tenantId;
        return this.documentsService.list(patientId, tenantId);
    }
    async remove(id, req) {
        const tenantId = req.user.tenantId;
        return this.documentsService.delete(id, tenantId);
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, roles_guard_2.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_document_dto_1.CreateDocumentDto, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)('patient/:patientId'),
    (0, roles_guard_2.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Param)('patientId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "listByPatient", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_guard_2.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "remove", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, common_1.Controller)('patients/documents'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map