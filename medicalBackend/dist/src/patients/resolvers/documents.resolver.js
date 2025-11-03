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
exports.DocumentsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const scanned_document_entity_1 = require("../entities/scanned-document.entity");
const documents_service_1 = require("../services/documents.service");
const gql_auth_guard_1 = require("../../auth/guards/gql-auth.guard");
const gql_roles_guard_1 = require("../../auth/guards/gql-roles.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const user_entity_1 = require("../../auth/entities/user.entity");
let DocumentsResolver = class DocumentsResolver {
    documentsService;
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    async patientDocuments(patientId, context) {
        const { user } = context.req;
        return this.documentsService.list(patientId, user.tenantId);
    }
    async deleteDocument(id, context) {
        const { user } = context.req;
        await this.documentsService.delete(id, user.tenantId);
        return true;
    }
};
exports.DocumentsResolver = DocumentsResolver;
__decorate([
    (0, graphql_1.Query)(() => [scanned_document_entity_1.ScannedDocument]),
    (0, roles_guard_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, graphql_1.Args)('patientId')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentsResolver.prototype, "patientDocuments", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, roles_guard_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentsResolver.prototype, "deleteDocument", null);
exports.DocumentsResolver = DocumentsResolver = __decorate([
    (0, graphql_1.Resolver)(() => scanned_document_entity_1.ScannedDocument),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, gql_roles_guard_1.GqlRolesGuard),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsResolver);
//# sourceMappingURL=documents.resolver.js.map