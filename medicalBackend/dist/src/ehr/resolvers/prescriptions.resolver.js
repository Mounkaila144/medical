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
exports.PrescriptionsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const prescriptions_service_1 = require("../services/prescriptions.service");
const prescription_entity_1 = require("../entities/prescription.entity");
const create_prescription_dto_1 = require("../dto/create-prescription.dto");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../common/guards/gql-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../../auth/entities/user.entity");
let PrescriptionsResolver = class PrescriptionsResolver {
    prescriptionsService;
    constructor(prescriptionsService) {
        this.prescriptionsService = prescriptionsService;
    }
    async createPrescription(createPrescriptionDto, context) {
        return this.prescriptionsService.create(context.req.user.tenantId, createPrescriptionDto);
    }
    async prescriptions(context) {
        return this.prescriptionsService.findAll(context.req.user.tenantId);
    }
    async prescription(id) {
        return this.prescriptionsService.findOne(id);
    }
};
exports.PrescriptionsResolver = PrescriptionsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => prescription_entity_1.Prescription),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, graphql_1.Args)('createPrescriptionDto')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_prescription_dto_1.CreatePrescriptionGqlDto, Object]),
    __metadata("design:returntype", Promise)
], PrescriptionsResolver.prototype, "createPrescription", null);
__decorate([
    (0, graphql_1.Query)(() => [prescription_entity_1.Prescription]),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PrescriptionsResolver.prototype, "prescriptions", null);
__decorate([
    (0, graphql_1.Query)(() => prescription_entity_1.Prescription),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PrescriptionsResolver.prototype, "prescription", null);
exports.PrescriptionsResolver = PrescriptionsResolver = __decorate([
    (0, graphql_1.Resolver)(() => prescription_entity_1.Prescription),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [prescriptions_service_1.PrescriptionsService])
], PrescriptionsResolver);
//# sourceMappingURL=prescriptions.resolver.js.map