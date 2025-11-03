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
exports.CreatePaymentGqlDto = exports.CreatePaymentDto = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const payment_entity_1 = require("../entities/payment.entity");
class CreatePaymentDto {
    invoiceId;
    amount;
    method;
    reference;
    paidAt;
    notes;
    currency;
}
exports.CreatePaymentDto = CreatePaymentDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "invoiceId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0.01),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePaymentDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(payment_entity_1.PaymentMethod),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "method", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "reference", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "paidAt", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "currency", void 0);
let CreatePaymentGqlDto = class CreatePaymentGqlDto {
    invoiceId;
    amount;
    method;
    reference;
};
exports.CreatePaymentGqlDto = CreatePaymentGqlDto;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePaymentGqlDto.prototype, "invoiceId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsDecimal)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CreatePaymentGqlDto.prototype, "amount", void 0);
__decorate([
    (0, graphql_1.Field)(() => payment_entity_1.PaymentMethod),
    (0, class_validator_1.IsEnum)(payment_entity_1.PaymentMethod),
    __metadata("design:type", String)
], CreatePaymentGqlDto.prototype, "method", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePaymentGqlDto.prototype, "reference", void 0);
exports.CreatePaymentGqlDto = CreatePaymentGqlDto = __decorate([
    (0, graphql_1.InputType)()
], CreatePaymentGqlDto);
//# sourceMappingURL=create-payment.dto.js.map