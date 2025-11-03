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
exports.EncountersController = void 0;
const common_1 = require("@nestjs/common");
const encounters_service_1 = require("../services/encounters.service");
const create_encounter_dto_1 = require("../dto/create-encounter.dto");
const update_encounter_dto_1 = require("../dto/update-encounter.dto");
const lock_encounter_dto_1 = require("../dto/lock-encounter.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../../auth/entities/user.entity");
const ehr_supervisor_guard_1 = require("../guards/ehr-supervisor.guard");
let EncountersController = class EncountersController {
    encountersService;
    constructor(encountersService) {
        this.encountersService = encountersService;
    }
    async create(createEncounterDto, req) {
        return this.encountersService.create(req.user.tenantId, createEncounterDto);
    }
    async findAll(req) {
        return this.encountersService.findAll(req.user.tenantId);
    }
    async findOne(id) {
        return this.encountersService.findOne(id);
    }
    async update(updateEncounterDto, req) {
        return this.encountersService.update(req.user.tenantId, updateEncounterDto);
    }
    async lock(lockEncounterDto, req) {
        return this.encountersService.lock(req.user.tenantId, lockEncounterDto);
    }
};
exports.EncountersController = EncountersController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_encounter_dto_1.CreateEncounterDto, Object]),
    __metadata("design:returntype", Promise)
], EncountersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EncountersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EncountersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(),
    (0, common_1.UseGuards)(ehr_supervisor_guard_1.EHRSupervisorGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_encounter_dto_1.UpdateEncounterDto, Object]),
    __metadata("design:returntype", Promise)
], EncountersController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('lock'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lock_encounter_dto_1.LockEncounterDto, Object]),
    __metadata("design:returntype", Promise)
], EncountersController.prototype, "lock", null);
exports.EncountersController = EncountersController = __decorate([
    (0, common_1.Controller)('encounters'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [encounters_service_1.EncountersService])
], EncountersController);
//# sourceMappingURL=encounters.controller.js.map