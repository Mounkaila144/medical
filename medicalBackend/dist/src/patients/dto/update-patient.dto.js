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
exports.UpdatePatientDto = void 0;
const class_validator_1 = require("class-validator");
const graphql_1 = require("@nestjs/graphql");
const patient_entity_1 = require("../entities/patient.entity");
const class_transformer_1 = require("class-transformer");
const graphql_type_json_1 = require("graphql-type-json");
let UpdatePatientDto = class UpdatePatientDto {
    firstName;
    lastName;
    dob;
    gender;
    bloodType;
    phone;
    email;
    address;
    clinicId;
};
exports.UpdatePatientDto = UpdatePatientDto;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UpdatePatientDto.prototype, "dob", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsEnum)(patient_entity_1.Gender),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "gender", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "bloodType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "phone", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdatePatientDto.prototype, "address", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "clinicId", void 0);
exports.UpdatePatientDto = UpdatePatientDto = __decorate([
    (0, graphql_1.InputType)()
], UpdatePatientDto);
//# sourceMappingURL=update-patient.dto.js.map