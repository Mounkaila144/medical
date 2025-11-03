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
exports.Shift = void 0;
const typeorm_1 = require("typeorm");
const staff_entity_1 = require("./staff.entity");
const graphql_1 = require("@nestjs/graphql");
let Shift = class Shift {
    id;
    staffId;
    staff;
    startAt;
    endAt;
    createdAt;
    updatedAt;
};
exports.Shift = Shift;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Shift.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Shift.prototype, "staffId", void 0);
__decorate([
    (0, graphql_1.Field)(() => staff_entity_1.Staff),
    (0, typeorm_1.ManyToOne)(() => staff_entity_1.Staff, staff => staff.shifts),
    (0, typeorm_1.JoinColumn)({ name: 'staffId' }),
    __metadata("design:type", staff_entity_1.Staff)
], Shift.prototype, "staff", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Shift.prototype, "startAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Shift.prototype, "endAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Shift.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Shift.prototype, "updatedAt", void 0);
exports.Shift = Shift = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('shifts')
], Shift);
//# sourceMappingURL=shift.entity.js.map