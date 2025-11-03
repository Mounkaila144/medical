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
exports.Staff = exports.StaffRole = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
const tenant_entity_1 = require("./tenant.entity");
const shift_entity_1 = require("./shift.entity");
const leave_request_entity_1 = require("./leave-request.entity");
const timesheet_entity_1 = require("./timesheet.entity");
var StaffRole;
(function (StaffRole) {
    StaffRole["DOCTOR"] = "DOCTOR";
    StaffRole["NURSE"] = "NURSE";
    StaffRole["RECEPTIONIST"] = "RECEPTIONIST";
    StaffRole["ADMIN"] = "ADMIN";
})(StaffRole || (exports.StaffRole = StaffRole = {}));
(0, graphql_1.registerEnumType)(StaffRole, {
    name: 'StaffRole',
    description: 'Rôles disponibles pour le personnel',
});
let Staff = class Staff {
    id;
    tenantId;
    tenant;
    firstName;
    lastName;
    role;
    hireDate;
    salary;
    createdAt;
    updatedAt;
    shifts;
    leaveRequests;
    timesheets;
};
exports.Staff = Staff;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Staff.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Staff.prototype, "tenantId", void 0);
__decorate([
    (0, graphql_1.Field)(() => tenant_entity_1.Tenant, { nullable: true }),
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant),
    (0, typeorm_1.JoinColumn)({ name: 'tenantId' }),
    __metadata("design:type", tenant_entity_1.Tenant)
], Staff.prototype, "tenant", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Staff.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Staff.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Staff.prototype, "role", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Staff.prototype, "hireDate", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Staff.prototype, "salary", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Staff.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Staff.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => [shift_entity_1.Shift], { nullable: true }),
    (0, typeorm_1.OneToMany)(() => shift_entity_1.Shift, shift => shift.staff),
    __metadata("design:type", Array)
], Staff.prototype, "shifts", void 0);
__decorate([
    (0, graphql_1.Field)(() => [leave_request_entity_1.LeaveRequest], { nullable: true }),
    (0, typeorm_1.OneToMany)(() => leave_request_entity_1.LeaveRequest, leaveRequest => leaveRequest.staff),
    __metadata("design:type", Array)
], Staff.prototype, "leaveRequests", void 0);
__decorate([
    (0, graphql_1.Field)(() => [timesheet_entity_1.Timesheet], { nullable: true }),
    (0, typeorm_1.OneToMany)(() => timesheet_entity_1.Timesheet, timesheet => timesheet.staff),
    __metadata("design:type", Array)
], Staff.prototype, "timesheets", void 0);
exports.Staff = Staff = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('staff')
], Staff);
//# sourceMappingURL=staff.entity.js.map