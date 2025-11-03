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
exports.PrescriptionItemGqlDto = exports.CreatePrescriptionGqlDto = exports.PrescriptionItemDto = exports.CreatePrescriptionDto = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreatePrescriptionDto {
    encounterId;
    practitionerId;
    expiresAt;
    items;
}
exports.CreatePrescriptionDto = CreatePrescriptionDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePrescriptionDto.prototype, "encounterId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePrescriptionDto.prototype, "practitionerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreatePrescriptionDto.prototype, "expiresAt", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PrescriptionItemDto),
    __metadata("design:type", Array)
], CreatePrescriptionDto.prototype, "items", void 0);
class PrescriptionItemDto {
    medication;
    dosage;
    frequency;
    duration;
    instructions;
}
exports.PrescriptionItemDto = PrescriptionItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PrescriptionItemDto.prototype, "medication", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PrescriptionItemDto.prototype, "dosage", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PrescriptionItemDto.prototype, "frequency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PrescriptionItemDto.prototype, "duration", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PrescriptionItemDto.prototype, "instructions", void 0);
let CreatePrescriptionGqlDto = class CreatePrescriptionGqlDto {
    encounterId;
    practitionerId;
    expiresAt;
    items;
};
exports.CreatePrescriptionGqlDto = CreatePrescriptionGqlDto;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePrescriptionGqlDto.prototype, "encounterId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePrescriptionGqlDto.prototype, "practitionerId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreatePrescriptionGqlDto.prototype, "expiresAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => [PrescriptionItemGqlDto]),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PrescriptionItemGqlDto),
    __metadata("design:type", Array)
], CreatePrescriptionGqlDto.prototype, "items", void 0);
exports.CreatePrescriptionGqlDto = CreatePrescriptionGqlDto = __decorate([
    (0, graphql_1.InputType)()
], CreatePrescriptionGqlDto);
let PrescriptionItemGqlDto = class PrescriptionItemGqlDto {
    medication;
    dosage;
    frequency;
    duration;
    instructions;
};
exports.PrescriptionItemGqlDto = PrescriptionItemGqlDto;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PrescriptionItemGqlDto.prototype, "medication", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PrescriptionItemGqlDto.prototype, "dosage", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PrescriptionItemGqlDto.prototype, "frequency", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PrescriptionItemGqlDto.prototype, "duration", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PrescriptionItemGqlDto.prototype, "instructions", void 0);
exports.PrescriptionItemGqlDto = PrescriptionItemGqlDto = __decorate([
    (0, graphql_1.InputType)()
], PrescriptionItemGqlDto);
//# sourceMappingURL=create-prescription.dto.js.map