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
exports.Timesheet = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
const staff_entity_1 = require("./staff.entity");
let Timesheet = class Timesheet {
    id;
    staffId;
    staff;
    month;
    year;
    hours;
    approved;
    createdAt;
    updatedAt;
};
exports.Timesheet = Timesheet;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Timesheet.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Timesheet.prototype, "staffId", void 0);
__decorate([
    (0, graphql_1.Field)(() => staff_entity_1.Staff),
    (0, typeorm_1.ManyToOne)(() => staff_entity_1.Staff, staff => staff.timesheets),
    (0, typeorm_1.JoinColumn)({ name: 'staffId' }),
    __metadata("design:type", staff_entity_1.Staff)
], Timesheet.prototype, "staff", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], Timesheet.prototype, "month", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], Timesheet.prototype, "year", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    (0, typeorm_1.Column)({ type: 'integer' }),
    __metadata("design:type", Number)
], Timesheet.prototype, "hours", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Timesheet.prototype, "approved", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Timesheet.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Timesheet.prototype, "updatedAt", void 0);
exports.Timesheet = Timesheet = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('timesheet')
], Timesheet);
//# sourceMappingURL=timesheet.entity.js.map