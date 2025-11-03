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
exports.LabResultsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const lab_results_service_1 = require("../services/lab-results.service");
const lab_result_entity_1 = require("../entities/lab-result.entity");
const create_lab_result_dto_1 = require("../dto/create-lab-result.dto");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../common/guards/gql-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
let LabResultsResolver = class LabResultsResolver {
    labResultsService;
    constructor(labResultsService) {
        this.labResultsService = labResultsService;
    }
    async addLabResult(createLabResultDto, context) {
        return this.labResultsService.add(context.req.user.tenantId, createLabResultDto);
    }
    async labResults(context) {
        return this.labResultsService.findAll(context.req.user.tenantId);
    }
    async patientLabResults(patientId, context) {
        return this.labResultsService.findAllByPatient(context.req.user.tenantId, patientId);
    }
    async labResult(id) {
        return this.labResultsService.findOne(id);
    }
};
exports.LabResultsResolver = LabResultsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => lab_result_entity_1.LabResult),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.DOCTOR, user_role_enum_1.UserRole.SUPERVISOR, user_role_enum_1.UserRole.LABORATORY_TECHNICIAN),
    __param(0, (0, graphql_1.Args)('createLabResultDto')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_lab_result_dto_1.CreateLabResultDto, Object]),
    __metadata("design:returntype", Promise)
], LabResultsResolver.prototype, "addLabResult", null);
__decorate([
    (0, graphql_1.Query)(() => [lab_result_entity_1.LabResult]),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.DOCTOR, user_role_enum_1.UserRole.NURSE, user_role_enum_1.UserRole.SUPERVISOR, user_role_enum_1.UserRole.LABORATORY_TECHNICIAN),
    __param(0, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LabResultsResolver.prototype, "labResults", null);
__decorate([
    (0, graphql_1.Query)(() => [lab_result_entity_1.LabResult]),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.DOCTOR, user_role_enum_1.UserRole.NURSE, user_role_enum_1.UserRole.SUPERVISOR, user_role_enum_1.UserRole.LABORATORY_TECHNICIAN),
    __param(0, (0, graphql_1.Args)('patientId')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LabResultsResolver.prototype, "patientLabResults", null);
__decorate([
    (0, graphql_1.Query)(() => lab_result_entity_1.LabResult),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.DOCTOR, user_role_enum_1.UserRole.NURSE, user_role_enum_1.UserRole.SUPERVISOR, user_role_enum_1.UserRole.LABORATORY_TECHNICIAN),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LabResultsResolver.prototype, "labResult", null);
exports.LabResultsResolver = LabResultsResolver = __decorate([
    (0, graphql_1.Resolver)(() => lab_result_entity_1.LabResult),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [lab_results_service_1.LabResultsService])
], LabResultsResolver);
//# sourceMappingURL=lab-results.resolver.js.map