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
exports.PaymentsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../entities");
const services_1 = require("../services");
const dto_1 = require("../dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../../auth/entities/user.entity");
let PaymentsResolver = class PaymentsResolver {
    paymentRepository;
    paymentsService;
    constructor(paymentRepository, paymentsService) {
        this.paymentRepository = paymentRepository;
        this.paymentsService = paymentsService;
    }
    async paymentsByInvoice(invoiceId, context) {
        return this.paymentRepository.find({
            where: {
                invoiceId,
                invoice: { tenantId: context.req.user.tenantId }
            },
            relations: ['invoice'],
        });
    }
    async createPayment(createPaymentDto, context) {
        return this.paymentsService.recordPayment(context.req.user.tenantId, createPaymentDto);
    }
};
exports.PaymentsResolver = PaymentsResolver;
__decorate([
    (0, graphql_1.Query)(() => [entities_1.Payment]),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, graphql_1.Args)('invoiceId')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsResolver.prototype, "paymentsByInvoice", null);
__decorate([
    (0, graphql_1.Mutation)(() => entities_1.Payment),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, graphql_1.Args)('createPaymentDto')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreatePaymentGqlDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsResolver.prototype, "createPayment", null);
exports.PaymentsResolver = PaymentsResolver = __decorate([
    (0, graphql_1.Resolver)(() => entities_1.Payment),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        services_1.PaymentsService])
], PaymentsResolver);
//# sourceMappingURL=payments.resolver.js.map