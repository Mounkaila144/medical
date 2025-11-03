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
exports.TariffsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
const dto_1 = require("../dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../../auth/entities/user.entity");
let TariffsResolver = class TariffsResolver {
    tariffRepository;
    constructor(tariffRepository) {
        this.tariffRepository = tariffRepository;
    }
    async tariffs(context) {
        return this.tariffRepository.find({
            where: { tenantId: context.req.user.tenantId },
        });
    }
    async tariffsByCategory(category, context) {
        return this.tariffRepository.find({
            where: {
                tenantId: context.req.user.tenantId,
                category,
            },
        });
    }
    async createTariff(createTariffDto, context) {
        const tariff = this.tariffRepository.create({
            ...createTariffDto,
            tenantId: context.req.user.tenantId,
        });
        return this.tariffRepository.save(tariff);
    }
};
exports.TariffsResolver = TariffsResolver;
__decorate([
    (0, graphql_1.Query)(() => [entities_1.Tariff]),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TariffsResolver.prototype, "tariffs", null);
__decorate([
    (0, graphql_1.Query)(() => [entities_1.Tariff]),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, graphql_1.Args)('category')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TariffsResolver.prototype, "tariffsByCategory", null);
__decorate([
    (0, graphql_1.Mutation)(() => entities_1.Tariff),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN),
    __param(0, (0, graphql_1.Args)('createTariffDto')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateTariffGqlDto, Object]),
    __metadata("design:returntype", Promise)
], TariffsResolver.prototype, "createTariff", null);
exports.TariffsResolver = TariffsResolver = __decorate([
    (0, graphql_1.Resolver)(() => entities_1.Tariff),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Tariff)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TariffsResolver);
//# sourceMappingURL=tariffs.resolver.js.map