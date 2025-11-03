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
exports.UpdateTimesheetInput = exports.CreateTimesheetInput = exports.TimesheetDto = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
let TimesheetDto = class TimesheetDto {
    id;
    staffId;
    month;
    year;
    hours;
    approved;
};
exports.TimesheetDto = TimesheetDto;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], TimesheetDto.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TimesheetDto.prototype, "staffId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], TimesheetDto.prototype, "month", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], TimesheetDto.prototype, "year", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], TimesheetDto.prototype, "hours", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], TimesheetDto.prototype, "approved", void 0);
exports.TimesheetDto = TimesheetDto = __decorate([
    (0, graphql_1.ObjectType)()
], TimesheetDto);
let CreateTimesheetInput = class CreateTimesheetInput {
    staffId;
    month;
    year;
    hours;
    approved = false;
};
exports.CreateTimesheetInput = CreateTimesheetInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTimesheetInput.prototype, "staffId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    __metadata("design:type", Number)
], CreateTimesheetInput.prototype, "month", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(2000),
    __metadata("design:type", Number)
], CreateTimesheetInput.prototype, "year", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsDecimal)(),
    __metadata("design:type", Number)
], CreateTimesheetInput.prototype, "hours", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateTimesheetInput.prototype, "approved", void 0);
exports.CreateTimesheetInput = CreateTimesheetInput = __decorate([
    (0, graphql_1.InputType)()
], CreateTimesheetInput);
let UpdateTimesheetInput = class UpdateTimesheetInput {
    hours;
    approved;
};
exports.UpdateTimesheetInput = UpdateTimesheetInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsDecimal)(),
    __metadata("design:type", Number)
], UpdateTimesheetInput.prototype, "hours", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateTimesheetInput.prototype, "approved", void 0);
exports.UpdateTimesheetInput = UpdateTimesheetInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateTimesheetInput);
//# sourceMappingURL=timesheet.dto.js.map