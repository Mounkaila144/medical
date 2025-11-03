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
exports.LeaveRequest = exports.LeaveStatus = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
const staff_entity_1 = require("./staff.entity");
var LeaveStatus;
(function (LeaveStatus) {
    LeaveStatus["PENDING"] = "PENDING";
    LeaveStatus["APPROVED"] = "APPROVED";
    LeaveStatus["REJECTED"] = "REJECTED";
})(LeaveStatus || (exports.LeaveStatus = LeaveStatus = {}));
(0, graphql_1.registerEnumType)(LeaveStatus, {
    name: 'LeaveStatus',
    description: 'Statut des demandes de congé',
});
let LeaveRequest = class LeaveRequest {
    id;
    staffId;
    staff;
    start;
    end;
    status;
    comment;
    createdAt;
    updatedAt;
};
exports.LeaveRequest = LeaveRequest;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LeaveRequest.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "staffId", void 0);
__decorate([
    (0, graphql_1.Field)(() => staff_entity_1.Staff),
    (0, typeorm_1.ManyToOne)(() => staff_entity_1.Staff, staff => staff.leaveRequests),
    (0, typeorm_1.JoinColumn)({ name: 'staffId' }),
    __metadata("design:type", staff_entity_1.Staff)
], LeaveRequest.prototype, "staff", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], LeaveRequest.prototype, "start", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], LeaveRequest.prototype, "end", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'varchar', default: LeaveStatus.PENDING }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], LeaveRequest.prototype, "comment", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LeaveRequest.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], LeaveRequest.prototype, "updatedAt", void 0);
exports.LeaveRequest = LeaveRequest = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('leave_request')
], LeaveRequest);
//# sourceMappingURL=leave-request.entity.js.map