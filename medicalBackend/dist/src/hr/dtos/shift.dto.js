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
exports.UpdateShiftInput = exports.CreateShiftInput = exports.ShiftDto = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
let ShiftDto = class ShiftDto {
    id;
    staffId;
    startAt;
    endAt;
};
exports.ShiftDto = ShiftDto;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ShiftDto.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ShiftDto.prototype, "staffId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], ShiftDto.prototype, "startAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], ShiftDto.prototype, "endAt", void 0);
exports.ShiftDto = ShiftDto = __decorate([
    (0, graphql_1.ObjectType)()
], ShiftDto);
let CreateShiftInput = class CreateShiftInput {
    staffId;
    startAt;
    endAt;
};
exports.CreateShiftInput = CreateShiftInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateShiftInput.prototype, "staffId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateShiftInput.prototype, "startAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateShiftInput.prototype, "endAt", void 0);
exports.CreateShiftInput = CreateShiftInput = __decorate([
    (0, graphql_1.InputType)()
], CreateShiftInput);
let UpdateShiftInput = class UpdateShiftInput {
    startAt;
    endAt;
};
exports.UpdateShiftInput = UpdateShiftInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], UpdateShiftInput.prototype, "startAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], UpdateShiftInput.prototype, "endAt", void 0);
exports.UpdateShiftInput = UpdateShiftInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateShiftInput);
//# sourceMappingURL=shift.dto.js.map