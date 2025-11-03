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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const payments_service_1 = require("../services/payments.service");
const dto_1 = require("../dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../../auth/entities/user.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_entity_1 = require("../entities/payment.entity");
let PaymentsController = class PaymentsController {
    paymentsService;
    paymentRepository;
    constructor(paymentsService, paymentRepository) {
        this.paymentsService = paymentsService;
        this.paymentRepository = paymentRepository;
    }
    async recordPayment(createPaymentDto, req) {
        return this.paymentsService.recordPayment(req.user.tenantId, createPaymentDto);
    }
    async getPayments(req, invoiceId, method) {
        const queryBuilder = this.paymentRepository
            .createQueryBuilder('payment')
            .leftJoinAndSelect('payment.invoice', 'invoice')
            .leftJoinAndSelect('invoice.patient', 'patient')
            .where('invoice.tenantId = :tenantId', { tenantId: req.user.tenantId })
            .orderBy('payment.paidAt', 'DESC');
        if (invoiceId) {
            queryBuilder.andWhere('payment.invoiceId = :invoiceId', { invoiceId });
        }
        if (method) {
            queryBuilder.andWhere('payment.method = :method', { method });
        }
        return queryBuilder.getMany();
    }
    async getPayment(id, req) {
        return this.paymentRepository
            .createQueryBuilder('payment')
            .leftJoinAndSelect('payment.invoice', 'invoice')
            .leftJoinAndSelect('invoice.patient', 'patient')
            .where('payment.id = :id', { id })
            .andWhere('invoice.tenantId = :tenantId', { tenantId: req.user.tenantId })
            .getOne();
    }
    async update(id, updatePaymentDto, req) {
        const payment = await this.paymentRepository
            .createQueryBuilder('payment')
            .leftJoinAndSelect('payment.invoice', 'invoice')
            .where('payment.id = :id', { id })
            .andWhere('invoice.tenantId = :tenantId', { tenantId: req.user.tenantId })
            .getOne();
        if (!payment) {
            throw new Error('Payment not found');
        }
        await this.paymentRepository.update(id, updatePaymentDto);
        return this.paymentRepository
            .createQueryBuilder('payment')
            .leftJoinAndSelect('payment.invoice', 'invoice')
            .leftJoinAndSelect('invoice.patient', 'patient')
            .where('payment.id = :id', { id })
            .getOne();
    }
    async remove(id, req) {
        const payment = await this.paymentRepository
            .createQueryBuilder('payment')
            .leftJoinAndSelect('payment.invoice', 'invoice')
            .where('payment.id = :id', { id })
            .andWhere('invoice.tenantId = :tenantId', { tenantId: req.user.tenantId })
            .getOne();
        if (!payment) {
            throw new Error('Payment not found');
        }
        await this.paymentRepository.delete(id);
        return { message: 'Payment deleted successfully' };
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreatePaymentDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "recordPayment", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('invoiceId')),
    __param(2, (0, common_1.Query)('method')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPayments", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPayment", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "remove", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(1, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService,
        typeorm_2.Repository])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map