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
exports.AddInvoiceLineGqlDto = exports.AddInvoiceLineDto = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class AddInvoiceLineDto {
    invoiceId;
    description;
    qty;
    unitPrice;
    thirdPartyRate = 0;
    tax = 0;
}
exports.AddInvoiceLineDto = AddInvoiceLineDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AddInvoiceLineDto.prototype, "invoiceId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AddInvoiceLineDto.prototype, "description", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], AddInvoiceLineDto.prototype, "qty", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], AddInvoiceLineDto.prototype, "unitPrice", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], AddInvoiceLineDto.prototype, "thirdPartyRate", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], AddInvoiceLineDto.prototype, "tax", void 0);
let AddInvoiceLineGqlDto = class AddInvoiceLineGqlDto {
    invoiceId;
    description;
    qty;
    unitPrice;
    thirdPartyRate = 0;
    tax = 0;
};
exports.AddInvoiceLineGqlDto = AddInvoiceLineGqlDto;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AddInvoiceLineGqlDto.prototype, "invoiceId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AddInvoiceLineGqlDto.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], AddInvoiceLineGqlDto.prototype, "qty", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], AddInvoiceLineGqlDto.prototype, "unitPrice", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: 0 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], AddInvoiceLineGqlDto.prototype, "thirdPartyRate", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: 0 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], AddInvoiceLineGqlDto.prototype, "tax", void 0);
exports.AddInvoiceLineGqlDto = AddInvoiceLineGqlDto = __decorate([
    (0, graphql_1.InputType)()
], AddInvoiceLineGqlDto);
//# sourceMappingURL=add-invoice-line.dto.js.map