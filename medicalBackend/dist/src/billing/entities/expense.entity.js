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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Expense = exports.PaymentStatus = exports.ExpenseStatus = exports.ExpenseCategory = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
var ExpenseCategory;
(function (ExpenseCategory) {
    ExpenseCategory["UTILITIES"] = "UTILITIES";
    ExpenseCategory["SUPPLIES"] = "SUPPLIES";
    ExpenseCategory["MEDICATIONS"] = "MEDICATIONS";
    ExpenseCategory["EQUIPMENT"] = "EQUIPMENT";
    ExpenseCategory["SALARIES"] = "SALARIES";
    ExpenseCategory["RENT"] = "RENT";
    ExpenseCategory["MAINTENANCE"] = "MAINTENANCE";
    ExpenseCategory["INSURANCE"] = "INSURANCE";
    ExpenseCategory["TAXES"] = "TAXES";
    ExpenseCategory["MARKETING"] = "MARKETING";
    ExpenseCategory["OTHER"] = "OTHER";
})(ExpenseCategory || (exports.ExpenseCategory = ExpenseCategory = {}));
var ExpenseStatus;
(function (ExpenseStatus) {
    ExpenseStatus["PENDING"] = "PENDING";
    ExpenseStatus["PAID"] = "PAID";
    ExpenseStatus["CANCELLED"] = "CANCELLED";
})(ExpenseStatus || (exports.ExpenseStatus = ExpenseStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["UNPAID"] = "UNPAID";
    PaymentStatus["PARTIALLY_PAID"] = "PARTIALLY_PAID";
    PaymentStatus["PAID"] = "PAID";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
(0, graphql_1.registerEnumType)(ExpenseCategory, {
    name: 'ExpenseCategory',
});
(0, graphql_1.registerEnumType)(ExpenseStatus, {
    name: 'ExpenseStatus',
});
(0, graphql_1.registerEnumType)(PaymentStatus, {
    name: 'PaymentStatus',
});
let Expense = class Expense {
    id;
    tenantId;
    reference;
    description;
    category;
    amount;
    currency;
    supplierName;
    supplierContact;
    status;
    paymentStatus;
    expenseDate;
    dueDate;
    paidDate;
    paymentMethod;
    invoiceNumber;
    receiptUrl;
    notes;
    createdAt;
    updatedAt;
};
exports.Expense = Expense;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Expense.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Expense.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Expense.prototype, "reference", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Expense.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ExpenseCategory,
    }),
    (0, graphql_1.Field)(() => ExpenseCategory),
    __metadata("design:type", String)
], Expense.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], Expense.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'XOF' }),
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Expense.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_name', nullable: true }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Expense.prototype, "supplierName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_contact', nullable: true }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Expense.prototype, "supplierContact", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ExpenseStatus,
        default: ExpenseStatus.PENDING,
    }),
    (0, graphql_1.Field)(() => ExpenseStatus),
    __metadata("design:type", String)
], Expense.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.UNPAID,
    }),
    (0, graphql_1.Field)(() => PaymentStatus),
    __metadata("design:type", String)
], Expense.prototype, "paymentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expense_date' }),
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Expense.prototype, "expenseDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'due_date', nullable: true }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], Expense.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'paid_date', nullable: true }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], Expense.prototype, "paidDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_method', nullable: true }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Expense.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_number', nullable: true }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Expense.prototype, "invoiceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'receipt_url', nullable: true }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Expense.prototype, "receiptUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Expense.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Expense.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Expense.prototype, "updatedAt", void 0);
exports.Expense = Expense = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('expenses')
], Expense);
//# sourceMappingURL=expense.entity.js.map