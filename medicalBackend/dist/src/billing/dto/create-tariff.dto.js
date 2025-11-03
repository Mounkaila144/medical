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
exports.CreateTariffGqlDto = exports.CreateTariffDto = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const tariff_entity_1 = require("../entities/tariff.entity");
class CreateTariffDto {
    code;
    name;
    description;
    category;
    costPrice;
    price;
    currency;
    duration;
    isActive;
}
exports.CreateTariffDto = CreateTariffDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTariffDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTariffDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTariffDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(tariff_entity_1.TariffCategory),
    __metadata("design:type", String)
], CreateTariffDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return parseFloat(value);
        }
        return value;
    }),
    __metadata("design:type", Number)
], CreateTariffDto.prototype, "costPrice", void 0);
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
], CreateTariffDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTariffDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return parseInt(value, 10);
        }
        return value;
    }),
    __metadata("design:type", Number)
], CreateTariffDto.prototype, "duration", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateTariffDto.prototype, "isActive", void 0);
let CreateTariffGqlDto = class CreateTariffGqlDto {
    code;
    name;
    description;
    category;
    price;
    currency;
    duration;
    isActive;
};
exports.CreateTariffGqlDto = CreateTariffGqlDto;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTariffGqlDto.prototype, "code", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTariffGqlDto.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTariffGqlDto.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => tariff_entity_1.TariffCategory),
    (0, class_validator_1.IsEnum)(tariff_entity_1.TariffCategory),
    __metadata("design:type", String)
], CreateTariffGqlDto.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return parseFloat(value);
        }
        return value;
    }),
    __metadata("design:type", Number)
], CreateTariffGqlDto.prototype, "price", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTariffGqlDto.prototype, "currency", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return parseInt(value, 10);
        }
        return value;
    }),
    __metadata("design:type", Number)
], CreateTariffGqlDto.prototype, "duration", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateTariffGqlDto.prototype, "isActive", void 0);
exports.CreateTariffGqlDto = CreateTariffGqlDto = __decorate([
    (0, graphql_1.InputType)()
], CreateTariffGqlDto);
//# sourceMappingURL=create-tariff.dto.js.map