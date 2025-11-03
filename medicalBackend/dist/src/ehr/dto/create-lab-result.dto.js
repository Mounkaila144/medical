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
exports.CreateLabResultDto = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const graphql_type_json_1 = require("graphql-type-json");
let CreateLabResultDto = class CreateLabResultDto {
    patientId;
    encounterId;
    labName;
    result;
    filePath;
    receivedAt;
};
exports.CreateLabResultDto = CreateLabResultDto;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateLabResultDto.prototype, "patientId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateLabResultDto.prototype, "encounterId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLabResultDto.prototype, "labName", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateLabResultDto.prototype, "result", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLabResultDto.prototype, "filePath", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateLabResultDto.prototype, "receivedAt", void 0);
exports.CreateLabResultDto = CreateLabResultDto = __decorate([
    (0, graphql_1.InputType)()
], CreateLabResultDto);
//# sourceMappingURL=create-lab-result.dto.js.map