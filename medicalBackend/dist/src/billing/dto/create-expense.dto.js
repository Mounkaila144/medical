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
exports.CreateExpenseGqlDto = exports.CreateExpenseDto = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const expense_entity_1 = require("../entities/expense.entity");
class CreateExpenseDto {
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
}
exports.CreateExpenseDto = CreateExpenseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "reference", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(expense_entity_1.ExpenseCategory),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return parseFloat(value);
        }
        return value;
    }),
    __metadata("design:type", Number)
], CreateExpenseDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "supplierName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "supplierContact", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(expense_entity_1.ExpenseStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(expense_entity_1.PaymentStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "paymentStatus", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "expenseDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "dueDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "paidDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "invoiceNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "receiptUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "notes", void 0);
let CreateExpenseGqlDto = class CreateExpenseGqlDto {
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
};
exports.CreateExpenseGqlDto = CreateExpenseGqlDto;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateExpenseGqlDto.prototype, "reference", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateExpenseGqlDto.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => expense_entity_1.ExpenseCategory),
    (0, class_validator_1.IsEnum)(expense_entity_1.ExpenseCategory),
    __metadata("design:type", String)
], CreateExpenseGqlDto.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateExpenseGqlDto.prototype, "amount", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseGqlDto.prototype, "currency", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseGqlDto.prototype, "supplierName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseGqlDto.prototype, "supplierContact", void 0);
__decorate([
    (0, graphql_1.Field)(() => expense_entity_1.ExpenseStatus, { nullable: true }),
    (0, class_validator_1.IsEnum)(expense_entity_1.ExpenseStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseGqlDto.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => expense_entity_1.PaymentStatus, { nullable: true }),
    (0, class_validator_1.IsEnum)(expense_entity_1.PaymentStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseGqlDto.prototype, "paymentStatus", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateExpenseGqlDto.prototype, "expenseDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseGqlDto.prototype, "dueDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseGqlDto.prototype, "paidDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseGqlDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseGqlDto.prototype, "invoiceNumber", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseGqlDto.prototype, "receiptUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseGqlDto.prototype, "notes", void 0);
exports.CreateExpenseGqlDto = CreateExpenseGqlDto = __decorate([
    (0, graphql_1.InputType)()
], CreateExpenseGqlDto);
//# sourceMappingURL=create-expense.dto.js.map