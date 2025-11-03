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
exports.ApproveLeaveRequestInput = exports.UpdateLeaveRequestInput = exports.CreateLeaveRequestInput = exports.LeaveRequestDto = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const leave_status_enum_1 = require("../enums/leave-status.enum");
let LeaveRequestDto = class LeaveRequestDto {
    id;
    staffId;
    start;
    end;
    status;
};
exports.LeaveRequestDto = LeaveRequestDto;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], LeaveRequestDto.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], LeaveRequestDto.prototype, "staffId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], LeaveRequestDto.prototype, "start", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], LeaveRequestDto.prototype, "end", void 0);
__decorate([
    (0, graphql_1.Field)(() => leave_status_enum_1.LeaveStatus),
    __metadata("design:type", String)
], LeaveRequestDto.prototype, "status", void 0);
exports.LeaveRequestDto = LeaveRequestDto = __decorate([
    (0, graphql_1.ObjectType)()
], LeaveRequestDto);
let CreateLeaveRequestInput = class CreateLeaveRequestInput {
    staffId;
    start;
    end;
};
exports.CreateLeaveRequestInput = CreateLeaveRequestInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateLeaveRequestInput.prototype, "staffId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateLeaveRequestInput.prototype, "start", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateLeaveRequestInput.prototype, "end", void 0);
exports.CreateLeaveRequestInput = CreateLeaveRequestInput = __decorate([
    (0, graphql_1.InputType)()
], CreateLeaveRequestInput);
let UpdateLeaveRequestInput = class UpdateLeaveRequestInput {
    status;
};
exports.UpdateLeaveRequestInput = UpdateLeaveRequestInput;
__decorate([
    (0, graphql_1.Field)(() => leave_status_enum_1.LeaveStatus),
    (0, class_validator_1.IsEnum)(leave_status_enum_1.LeaveStatus),
    __metadata("design:type", String)
], UpdateLeaveRequestInput.prototype, "status", void 0);
exports.UpdateLeaveRequestInput = UpdateLeaveRequestInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateLeaveRequestInput);
let ApproveLeaveRequestInput = class ApproveLeaveRequestInput {
    id;
    status;
    comment;
};
exports.ApproveLeaveRequestInput = ApproveLeaveRequestInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ApproveLeaveRequestInput.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => leave_status_enum_1.LeaveStatus),
    (0, class_validator_1.IsEnum)(leave_status_enum_1.LeaveStatus),
    __metadata("design:type", String)
], ApproveLeaveRequestInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApproveLeaveRequestInput.prototype, "comment", void 0);
exports.ApproveLeaveRequestInput = ApproveLeaveRequestInput = __decorate([
    (0, graphql_1.InputType)()
], ApproveLeaveRequestInput);
//# sourceMappingURL=leave-request.dto.js.map