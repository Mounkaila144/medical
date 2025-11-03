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
exports.LabResultsController = void 0;
const common_1 = require("@nestjs/common");
const lab_results_service_1 = require("../services/lab-results.service");
const create_lab_result_dto_1 = require("../dto/create-lab-result.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../../auth/entities/user.entity");
let LabResultsController = class LabResultsController {
    labResultsService;
    constructor(labResultsService) {
        this.labResultsService = labResultsService;
    }
    async create(createLabResultDto, req) {
        return this.labResultsService.add(req.user.tenantId, createLabResultDto);
    }
    async findAll(req) {
        return this.labResultsService.findAll(req.user.tenantId);
    }
    async findAllByPatient(patientId, req) {
        return this.labResultsService.findAllByPatient(req.user.tenantId, patientId);
    }
    async findOne(id) {
        return this.labResultsService.findOne(id);
    }
};
exports.LabResultsController = LabResultsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_lab_result_dto_1.CreateLabResultDto, Object]),
    __metadata("design:returntype", Promise)
], LabResultsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LabResultsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('patient/:patientId'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Param)('patientId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LabResultsController.prototype, "findAllByPatient", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LabResultsController.prototype, "findOne", null);
exports.LabResultsController = LabResultsController = __decorate([
    (0, common_1.Controller)('labs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [lab_results_service_1.LabResultsService])
], LabResultsController);
//# sourceMappingURL=lab-results.controller.js.map