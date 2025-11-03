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
exports.CreateMedicalHistoryItemDto = void 0;
const class_validator_1 = require("class-validator");
const graphql_1 = require("@nestjs/graphql");
const medical_history_item_entity_1 = require("../entities/medical-history-item.entity");
let CreateMedicalHistoryItemDto = class CreateMedicalHistoryItemDto {
    patientId;
    type;
    label;
    note;
};
exports.CreateMedicalHistoryItemDto = CreateMedicalHistoryItemDto;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateMedicalHistoryItemDto.prototype, "patientId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsEnum)(medical_history_item_entity_1.MedicalHistoryType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateMedicalHistoryItemDto.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateMedicalHistoryItemDto.prototype, "label", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateMedicalHistoryItemDto.prototype, "note", void 0);
exports.CreateMedicalHistoryItemDto = CreateMedicalHistoryItemDto = __decorate([
    (0, graphql_1.InputType)()
], CreateMedicalHistoryItemDto);
//# sourceMappingURL=create-medical-history-item.dto.js.map