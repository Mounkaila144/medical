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
exports.ExpensesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../../auth/entities/user.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const expense_entity_1 = require("../entities/expense.entity");
const dto_1 = require("../dto");
let ExpensesController = class ExpensesController {
    expenseRepository;
    constructor(expenseRepository) {
        this.expenseRepository = expenseRepository;
    }
    async create(createExpenseDto, req) {
        const expense = this.expenseRepository.create({
            ...createExpenseDto,
            tenantId: req.user.tenantId,
        });
        return this.expenseRepository.save(expense);
    }
    async findAll(req, category, status, paymentStatus, startDate, endDate) {
        const queryBuilder = this.expenseRepository
            .createQueryBuilder('expense')
            .where('expense.tenantId = :tenantId', { tenantId: req.user.tenantId })
            .orderBy('expense.expenseDate', 'DESC');
        if (category) {
            queryBuilder.andWhere('expense.category = :category', { category });
        }
        if (status) {
            queryBuilder.andWhere('expense.status = :status', { status });
        }
        if (paymentStatus) {
            queryBuilder.andWhere('expense.paymentStatus = :paymentStatus', { paymentStatus });
        }
        if (startDate) {
            queryBuilder.andWhere('expense.expenseDate >= :startDate', { startDate });
        }
        if (endDate) {
            queryBuilder.andWhere('expense.expenseDate <= :endDate', { endDate });
        }
        return queryBuilder.getMany();
    }
    async getStats(req) {
        const totalExpenses = await this.expenseRepository
            .createQueryBuilder('expense')
            .select('SUM(expense.amount)', 'total')
            .where('expense.tenantId = :tenantId', { tenantId: req.user.tenantId })
            .andWhere('expense.status != :status', { status: expense_entity_1.ExpenseStatus.CANCELLED })
            .getRawOne();
        const paidExpenses = await this.expenseRepository
            .createQueryBuilder('expense')
            .select('SUM(expense.amount)', 'total')
            .where('expense.tenantId = :tenantId', { tenantId: req.user.tenantId })
            .andWhere('expense.paymentStatus = :paymentStatus', { paymentStatus: expense_entity_1.PaymentStatus.PAID })
            .getRawOne();
        const pendingExpenses = await this.expenseRepository
            .createQueryBuilder('expense')
            .select('SUM(expense.amount)', 'total')
            .where('expense.tenantId = :tenantId', { tenantId: req.user.tenantId })
            .andWhere('expense.paymentStatus = :paymentStatus', { paymentStatus: expense_entity_1.PaymentStatus.UNPAID })
            .getRawOne();
        const byCategory = await this.expenseRepository
            .createQueryBuilder('expense')
            .select('expense.category', 'category')
            .addSelect('SUM(expense.amount)', 'total')
            .where('expense.tenantId = :tenantId', { tenantId: req.user.tenantId })
            .andWhere('expense.status != :status', { status: expense_entity_1.ExpenseStatus.CANCELLED })
            .groupBy('expense.category')
            .getRawMany();
        return {
            totalExpenses: parseFloat(totalExpenses?.total || '0'),
            paidExpenses: parseFloat(paidExpenses?.total || '0'),
            pendingExpenses: parseFloat(pendingExpenses?.total || '0'),
            byCategory,
        };
    }
    async findOne(id, req) {
        return this.expenseRepository.findOne({
            where: { id, tenantId: req.user.tenantId },
        });
    }
    async update(id, updateExpenseDto, req) {
        await this.expenseRepository.update({ id, tenantId: req.user.tenantId }, updateExpenseDto);
        return this.expenseRepository.findOne({
            where: { id, tenantId: req.user.tenantId },
        });
    }
    async remove(id, req) {
        await this.expenseRepository.delete({
            id,
            tenantId: req.user.tenantId,
        });
        return { message: 'Expense deleted successfully' };
    }
};
exports.ExpensesController = ExpensesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateExpenseDto, Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('paymentStatus')),
    __param(4, (0, common_1.Query)('startDate')),
    __param(5, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "remove", null);
exports.ExpensesController = ExpensesController = __decorate([
    (0, common_1.Controller)('expenses'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, typeorm_1.InjectRepository)(expense_entity_1.Expense)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ExpensesController);
//# sourceMappingURL=expenses.controller.js.map