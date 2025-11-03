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
exports.UpdateStaffInput = exports.CreateStaffInput = exports.StaffDto = void 0;
const graphql_1 = require("@nestjs/graphql");
const staff_role_enum_1 = require("../enums/staff-role.enum");
const class_validator_1 = require("class-validator");
let StaffDto = class StaffDto {
    id;
    tenantId;
    firstName;
    lastName;
    role;
    hireDate;
    salary;
};
exports.StaffDto = StaffDto;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], StaffDto.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], StaffDto.prototype, "tenantId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], StaffDto.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], StaffDto.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)(() => staff_role_enum_1.StaffRole),
    __metadata("design:type", String)
], StaffDto.prototype, "role", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], StaffDto.prototype, "hireDate", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], StaffDto.prototype, "salary", void 0);
exports.StaffDto = StaffDto = __decorate([
    (0, graphql_1.ObjectType)()
], StaffDto);
let CreateStaffInput = class CreateStaffInput {
    tenantId;
    firstName;
    lastName;
    role;
    hireDate;
    salary;
};
exports.CreateStaffInput = CreateStaffInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateStaffInput.prototype, "tenantId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateStaffInput.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateStaffInput.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)(() => staff_role_enum_1.StaffRole),
    (0, class_validator_1.IsEnum)(staff_role_enum_1.StaffRole),
    __metadata("design:type", String)
], CreateStaffInput.prototype, "role", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateStaffInput.prototype, "hireDate", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsDecimal)(),
    __metadata("design:type", Number)
], CreateStaffInput.prototype, "salary", void 0);
exports.CreateStaffInput = CreateStaffInput = __decorate([
    (0, graphql_1.InputType)()
], CreateStaffInput);
let UpdateStaffInput = class UpdateStaffInput {
    firstName;
    lastName;
    role;
    hireDate;
    salary;
};
exports.UpdateStaffInput = UpdateStaffInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateStaffInput.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateStaffInput.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)(() => staff_role_enum_1.StaffRole, { nullable: true }),
    (0, class_validator_1.IsEnum)(staff_role_enum_1.StaffRole),
    __metadata("design:type", String)
], UpdateStaffInput.prototype, "role", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], UpdateStaffInput.prototype, "hireDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsDecimal)(),
    __metadata("design:type", Number)
], UpdateStaffInput.prototype, "salary", void 0);
exports.UpdateStaffInput = UpdateStaffInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateStaffInput);
//# sourceMappingURL=staff.dto.js.map