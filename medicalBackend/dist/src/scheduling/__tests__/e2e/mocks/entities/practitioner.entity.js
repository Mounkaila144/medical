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
exports.Practitioner = void 0;
const typeorm_1 = require("typeorm");
const availability_entity_1 = require("./availability.entity");
const appointment_entity_1 = require("./appointment.entity");
let Practitioner = class Practitioner {
    id;
    tenantId;
    firstName;
    lastName;
    specialty;
    color;
    availabilities;
    appointments;
};
exports.Practitioner = Practitioner;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Practitioner.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], Practitioner.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_name' }),
    __metadata("design:type", String)
], Practitioner.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_name' }),
    __metadata("design:type", String)
], Practitioner.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Practitioner.prototype, "specialty", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Practitioner.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => availability_entity_1.Availability, (availability) => availability.practitioner),
    __metadata("design:type", Array)
], Practitioner.prototype, "availabilities", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => appointment_entity_1.Appointment, (appointment) => appointment.practitioner),
    __metadata("design:type", Array)
], Practitioner.prototype, "appointments", void 0);
exports.Practitioner = Practitioner = __decorate([
    (0, typeorm_1.Entity)('practitioners')
], Practitioner);
//# sourceMappingURL=practitioner.entity.js.map