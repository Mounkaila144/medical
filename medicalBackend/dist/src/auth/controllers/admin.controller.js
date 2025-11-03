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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const superadmin_service_1 = require("../services/superadmin.service");
const create_tenant_dto_1 = require("../dto/create-tenant.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const user_entity_1 = require("../entities/user.entity");
let AdminController = class AdminController {
    superadminService;
    constructor(superadminService) {
        this.superadminService = superadminService;
    }
    async findAllTenants() {
        return this.superadminService.findAllTenants();
    }
    async createTenant(createTenantDto) {
        return this.superadminService.createTenantWithAdmin(createTenantDto);
    }
    async deactivateTenant(id) {
        return this.superadminService.deactivateTenant(id);
    }
    async reactivateTenant(id) {
        return this.superadminService.reactivateTenant(id);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('tenants'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "findAllTenants", null);
__decorate([
    (0, common_1.Post)('tenants'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tenant_dto_1.CreateTenantDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createTenant", null);
__decorate([
    (0, common_1.Post)('tenants/:id/deactivate'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deactivateTenant", null);
__decorate([
    (0, common_1.Post)('tenants/:id/reactivate'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "reactivateTenant", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN),
    __metadata("design:paramtypes", [superadmin_service_1.SuperadminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map