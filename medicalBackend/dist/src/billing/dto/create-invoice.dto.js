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
exports.CreateInvoiceGqlDto = exports.CreateInvoiceDto = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const billing_address_dto_1 = require("./billing-address.dto");
class CreateInvoiceDto {
    patientId;
    number;
    dueAt;
    encounterId;
    issueDate;
    billingAddress;
    notes;
}
exports.CreateInvoiceDto = CreateInvoiceDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "patientId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "number", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateInvoiceDto.prototype, "dueAt", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "encounterId", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateInvoiceDto.prototype, "issueDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", billing_address_dto_1.BillingAddressDto)
], CreateInvoiceDto.prototype, "billingAddress", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "notes", void 0);
let CreateInvoiceGqlDto = class CreateInvoiceGqlDto {
    patientId;
    number;
    dueAt;
    encounterId;
    issueDate;
    billingAddress;
    notes;
};
exports.CreateInvoiceGqlDto = CreateInvoiceGqlDto;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateInvoiceGqlDto.prototype, "patientId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateInvoiceGqlDto.prototype, "number", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateInvoiceGqlDto.prototype, "dueAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateInvoiceGqlDto.prototype, "encounterId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateInvoiceGqlDto.prototype, "issueDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => billing_address_dto_1.BillingAddressDto, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", billing_address_dto_1.BillingAddressDto)
], CreateInvoiceGqlDto.prototype, "billingAddress", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateInvoiceGqlDto.prototype, "notes", void 0);
exports.CreateInvoiceGqlDto = CreateInvoiceGqlDto = __decorate([
    (0, graphql_1.InputType)()
], CreateInvoiceGqlDto);
//# sourceMappingURL=create-invoice.dto.js.map