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
exports.TariffsController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
const dto_1 = require("../dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../../auth/entities/user.entity");
let TariffsController = class TariffsController {
    tariffRepository;
    constructor(tariffRepository) {
        this.tariffRepository = tariffRepository;
    }
    async create(createTariffDto, req) {
        const tariff = this.tariffRepository.create({
            ...createTariffDto,
            tenantId: req.user.tenantId,
        });
        return this.tariffRepository.save(tariff);
    }
    async findAll(req, category, isActive, search) {
        const where = { tenantId: req.user.tenantId };
        if (category) {
            where.category = category;
        }
        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }
        if (search) {
            return this.tariffRepository
                .createQueryBuilder('tariff')
                .where('tariff.tenantId = :tenantId', { tenantId: req.user.tenantId })
                .andWhere('(tariff.name LIKE :search OR tariff.code LIKE :search OR tariff.description LIKE :search)', { search: `%${search}%` })
                .andWhere(category ? 'tariff.category = :category' : '1=1', { category })
                .andWhere(isActive !== undefined ? 'tariff.isActive = :isActive' : '1=1', { isActive: isActive === 'true' })
                .getMany();
        }
        return this.tariffRepository.find({ where });
    }
    async findOne(id, req) {
        return this.tariffRepository.findOne({
            where: { id, tenantId: req.user.tenantId },
        });
    }
    async findByCategory(category, req) {
        return this.tariffRepository.find({
            where: {
                tenantId: req.user.tenantId,
                category,
            },
        });
    }
    async update(id, updateTariffDto, req) {
        await this.tariffRepository.update({ id, tenantId: req.user.tenantId }, updateTariffDto);
        return this.tariffRepository.findOne({
            where: { id, tenantId: req.user.tenantId },
        });
    }
    async remove(id, req) {
        await this.tariffRepository.delete({
            id,
            tenantId: req.user.tenantId,
        });
        return { message: 'Tariff deleted successfully' };
    }
};
exports.TariffsController = TariffsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateTariffDto, Object]),
    __metadata("design:returntype", Promise)
], TariffsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('isActive')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], TariffsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TariffsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('category/:category'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Param)('category')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TariffsController.prototype, "findByCategory", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TariffsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TariffsController.prototype, "remove", null);
exports.TariffsController = TariffsController = __decorate([
    (0, common_1.Controller)('tariffs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Tariff)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TariffsController);
//# sourceMappingURL=tariffs.controller.js.map