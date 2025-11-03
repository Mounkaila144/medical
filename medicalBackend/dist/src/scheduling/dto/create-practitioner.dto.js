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
exports.CreatePractitionerDto = exports.DayOfWeek = exports.Speciality = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var Speciality;
(function (Speciality) {
    Speciality["GENERAL_MEDICINE"] = "GENERAL_MEDICINE";
    Speciality["PEDIATRICS"] = "PEDIATRICS";
    Speciality["CARDIOLOGY"] = "CARDIOLOGY";
    Speciality["DERMATOLOGY"] = "DERMATOLOGY";
    Speciality["NEUROLOGY"] = "NEUROLOGY";
    Speciality["ORTHOPEDICS"] = "ORTHOPEDICS";
    Speciality["GYNECOLOGY"] = "GYNECOLOGY";
    Speciality["OPHTHALMOLOGY"] = "OPHTHALMOLOGY";
    Speciality["DENTISTRY"] = "DENTISTRY";
    Speciality["PSYCHIATRY"] = "PSYCHIATRY";
})(Speciality || (exports.Speciality = Speciality = {}));
var DayOfWeek;
(function (DayOfWeek) {
    DayOfWeek["MONDAY"] = "MONDAY";
    DayOfWeek["TUESDAY"] = "TUESDAY";
    DayOfWeek["WEDNESDAY"] = "WEDNESDAY";
    DayOfWeek["THURSDAY"] = "THURSDAY";
    DayOfWeek["FRIDAY"] = "FRIDAY";
    DayOfWeek["SATURDAY"] = "SATURDAY";
    DayOfWeek["SUNDAY"] = "SUNDAY";
})(DayOfWeek || (exports.DayOfWeek = DayOfWeek = {}));
class TimeSlot {
    start;
    end;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TimeSlot.prototype, "start", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TimeSlot.prototype, "end", void 0);
class WorkingHours {
    dayOfWeek;
    slots;
}
__decorate([
    (0, class_validator_1.IsEnum)(DayOfWeek),
    __metadata("design:type", String)
], WorkingHours.prototype, "dayOfWeek", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TimeSlot),
    __metadata("design:type", Array)
], WorkingHours.prototype, "slots", void 0);
class CreatePractitionerDto {
    firstName;
    lastName;
    speciality;
    email;
    phoneNumber;
    workingHours;
    slotDuration;
    color;
}
exports.CreatePractitionerDto = CreatePractitionerDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePractitionerDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePractitionerDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(Speciality),
    __metadata("design:type", String)
], CreatePractitionerDto.prototype, "speciality", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreatePractitionerDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePractitionerDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WorkingHours),
    __metadata("design:type", Array)
], CreatePractitionerDto.prototype, "workingHours", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(5),
    (0, class_validator_1.Max)(120),
    __metadata("design:type", Number)
], CreatePractitionerDto.prototype, "slotDuration", void 0);
__decorate([
    (0, class_validator_1.IsHexColor)(),
    __metadata("design:type", String)
], CreatePractitionerDto.prototype, "color", void 0);
//# sourceMappingURL=create-practitioner.dto.js.map