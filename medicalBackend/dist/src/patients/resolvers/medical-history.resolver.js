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
exports.MedicalHistoryResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const medical_history_item_entity_1 = require("../entities/medical-history-item.entity");
const medical_history_service_1 = require("../services/medical-history.service");
const create_medical_history_item_dto_1 = require("../dto/create-medical-history-item.dto");
const gql_auth_guard_1 = require("../../auth/guards/gql-auth.guard");
const gql_roles_guard_1 = require("../../auth/guards/gql-roles.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const user_entity_1 = require("../../auth/entities/user.entity");
let MedicalHistoryResolver = class MedicalHistoryResolver {
    medicalHistoryService;
    constructor(medicalHistoryService) {
        this.medicalHistoryService = medicalHistoryService;
    }
    async patientMedicalHistory(patientId, context) {
        const { user } = context.req;
        return this.medicalHistoryService.listByPatient(patientId, user.tenantId);
    }
    async addMedicalHistoryItem(createItemDto, context) {
        const { user } = context.req;
        return this.medicalHistoryService.addItem(createItemDto, user.tenantId);
    }
    async removeMedicalHistoryItem(id, context) {
        const { user } = context.req;
        await this.medicalHistoryService.remove(id, user.tenantId);
        return true;
    }
};
exports.MedicalHistoryResolver = MedicalHistoryResolver;
__decorate([
    (0, graphql_1.Query)(() => [medical_history_item_entity_1.MedicalHistoryItem]),
    (0, roles_guard_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, graphql_1.Args)('patientId')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MedicalHistoryResolver.prototype, "patientMedicalHistory", null);
__decorate([
    (0, graphql_1.Mutation)(() => medical_history_item_entity_1.MedicalHistoryItem),
    (0, roles_guard_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_medical_history_item_dto_1.CreateMedicalHistoryItemDto, Object]),
    __metadata("design:returntype", Promise)
], MedicalHistoryResolver.prototype, "addMedicalHistoryItem", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, roles_guard_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MedicalHistoryResolver.prototype, "removeMedicalHistoryItem", null);
exports.MedicalHistoryResolver = MedicalHistoryResolver = __decorate([
    (0, graphql_1.Resolver)(() => medical_history_item_entity_1.MedicalHistoryItem),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, gql_roles_guard_1.GqlRolesGuard),
    __metadata("design:paramtypes", [medical_history_service_1.MedicalHistoryService])
], MedicalHistoryResolver);
//# sourceMappingURL=medical-history.resolver.js.map