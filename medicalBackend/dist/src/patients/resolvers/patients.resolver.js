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
exports.PatientsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const patient_entity_1 = require("../entities/patient.entity");
const patients_service_1 = require("../services/patients.service");
const create_patient_dto_1 = require("../dto/create-patient.dto");
const update_patient_dto_1 = require("../dto/update-patient.dto");
const search_patient_dto_1 = require("../dto/search-patient.dto");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../auth/guards/gql-auth.guard");
const gql_roles_guard_1 = require("../../auth/guards/gql-roles.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const user_entity_1 = require("../../auth/entities/user.entity");
let PatientsResolver = class PatientsResolver {
    patientsService;
    constructor(patientsService) {
        this.patientsService = patientsService;
    }
    async createPatient(createPatientDto, context) {
        const { user } = context.req;
        return this.patientsService.create(createPatientDto, user.tenantId);
    }
    async patients(context) {
        const { user } = context.req;
        return this.patientsService.findAll(user.tenantId);
    }
    async patient(id, context) {
        const { user } = context.req;
        return this.patientsService.findOne(id, user.tenantId);
    }
    async searchPatients(searchParams, context) {
        const { user } = context.req;
        return this.patientsService.search({
            ...searchParams,
            clinicId: user.tenantId
        });
    }
    async updatePatient(id, updatePatientDto, context) {
        const { user } = context.req;
        return this.patientsService.update(id, updatePatientDto, user.tenantId);
    }
    async archivePatient(id, context) {
        const { user } = context.req;
        await this.patientsService.archive(id, user.tenantId);
        return true;
    }
};
exports.PatientsResolver = PatientsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => patient_entity_1.Patient),
    (0, roles_guard_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_patient_dto_1.CreatePatientDto, Object]),
    __metadata("design:returntype", Promise)
], PatientsResolver.prototype, "createPatient", null);
__decorate([
    (0, graphql_1.Query)(() => [patient_entity_1.Patient]),
    (0, roles_guard_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PatientsResolver.prototype, "patients", null);
__decorate([
    (0, graphql_1.Query)(() => patient_entity_1.Patient),
    (0, roles_guard_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PatientsResolver.prototype, "patient", null);
__decorate([
    (0, graphql_1.Query)(() => [patient_entity_1.Patient]),
    (0, roles_guard_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_patient_dto_1.SearchPatientDto, Object]),
    __metadata("design:returntype", Promise)
], PatientsResolver.prototype, "searchPatients", null);
__decorate([
    (0, graphql_1.Mutation)(() => patient_entity_1.Patient),
    (0, roles_guard_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_patient_dto_1.UpdatePatientDto, Object]),
    __metadata("design:returntype", Promise)
], PatientsResolver.prototype, "updatePatient", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, roles_guard_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PatientsResolver.prototype, "archivePatient", null);
exports.PatientsResolver = PatientsResolver = __decorate([
    (0, graphql_1.Resolver)(() => patient_entity_1.Patient),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, gql_roles_guard_1.GqlRolesGuard),
    __metadata("design:paramtypes", [patients_service_1.PatientsService])
], PatientsResolver);
//# sourceMappingURL=patients.resolver.js.map