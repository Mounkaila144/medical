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
exports.CreateAppointmentDto = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const urgency_level_enum_1 = require("../enums/urgency-level.enum");
let CreateAppointmentDto = class CreateAppointmentDto {
    patientId;
    practitionerId;
    startAt;
    endAt;
    room;
    reason;
    urgency;
};
exports.CreateAppointmentDto = CreateAppointmentDto;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "patientId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "practitionerId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateAppointmentDto.prototype, "startAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateAppointmentDto.prototype, "endAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "room", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "reason", void 0);
__decorate([
    (0, graphql_1.Field)(() => urgency_level_enum_1.UrgencyLevel, { defaultValue: urgency_level_enum_1.UrgencyLevel.ROUTINE }),
    (0, class_validator_1.IsEnum)(urgency_level_enum_1.UrgencyLevel),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "urgency", void 0);
exports.CreateAppointmentDto = CreateAppointmentDto = __decorate([
    (0, graphql_1.InputType)()
], CreateAppointmentDto);
//# sourceMappingURL=create-appointment.dto.js.map