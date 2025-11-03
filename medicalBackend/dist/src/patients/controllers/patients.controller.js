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
exports.PatientsController = void 0;
const common_1 = require("@nestjs/common");
const patients_service_1 = require("../services/patients.service");
const create_patient_dto_1 = require("../dto/create-patient.dto");
const update_patient_dto_1 = require("../dto/update-patient.dto");
const search_patient_dto_1 = require("../dto/search-patient.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_guard_2 = require("../../auth/guards/roles.guard");
const user_entity_1 = require("../../auth/entities/user.entity");
const whatsapp_service_1 = require("../services/whatsapp.service");
let PatientsController = class PatientsController {
    patientsService;
    whatsappService;
    constructor(patientsService, whatsappService) {
        this.patientsService = patientsService;
        this.whatsappService = whatsappService;
    }
    async create(createPatientDto, req, res) {
        const tenantId = req.user.tenantId;
        const patient = await this.patientsService.create(createPatientDto, tenantId);
        const whatsappUrl = this.whatsappService.generateWhatsappLink(patient);
        res.status(201).json({
            patient,
            redirectUrl: whatsappUrl
        });
    }
    async findAll(req, query) {
        const tenantId = req.user.tenantId;
        const { page, limit, search, sortBy, sortOrder, gender, ...otherParams } = query;
        return this.patientsService.findAll(tenantId);
    }
    async search(searchParams, req) {
        const tenantId = req.user.tenantId;
        return this.patientsService.search({ ...searchParams, clinicId: tenantId });
    }
    async findOne(id, req) {
        const tenantId = req.user.tenantId;
        return this.patientsService.findOne(id, tenantId);
    }
    async update(id, updatePatientDto, req) {
        const tenantId = req.user.tenantId;
        return this.patientsService.update(id, updatePatientDto, tenantId);
    }
    async remove(id, req) {
        const tenantId = req.user.tenantId;
        return this.patientsService.archive(id, tenantId);
    }
};
exports.PatientsController = PatientsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_guard_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_patient_dto_1.CreatePatientDto, Object, Object]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_guard_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, roles_guard_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_patient_dto_1.SearchPatientDto, Object]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "search", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_guard_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_guard_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_patient_dto_1.UpdatePatientDto, Object]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_guard_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "remove", null);
exports.PatientsController = PatientsController = __decorate([
    (0, common_1.Controller)('patients'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_2.RolesGuard),
    __metadata("design:paramtypes", [patients_service_1.PatientsService,
        whatsapp_service_1.WhatsappService])
], PatientsController);
//# sourceMappingURL=patients.controller.js.map