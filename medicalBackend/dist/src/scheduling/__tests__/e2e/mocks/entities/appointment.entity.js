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
exports.Appointment = exports.UrgencyLevel = exports.AppointmentStatus = void 0;
const typeorm_1 = require("typeorm");
const practitioner_entity_1 = require("./practitioner.entity");
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["BOOKED"] = "BOOKED";
    AppointmentStatus["COMPLETED"] = "COMPLETED";
    AppointmentStatus["CANCELLED"] = "CANCELLED";
    AppointmentStatus["NO_SHOW"] = "NO_SHOW";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
var UrgencyLevel;
(function (UrgencyLevel) {
    UrgencyLevel["ROUTINE"] = "ROUTINE";
    UrgencyLevel["URGENT"] = "URGENT";
    UrgencyLevel["EMERGENCY"] = "EMERGENCY";
})(UrgencyLevel || (exports.UrgencyLevel = UrgencyLevel = {}));
let Appointment = class Appointment {
    id;
    tenantId;
    patientId;
    practitionerId;
    status;
    startAt;
    endAt;
    room;
    reason;
    urgency;
    practitioner;
};
exports.Appointment = Appointment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Appointment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    __metadata("design:type", String)
], Appointment.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patient_id' }),
    __metadata("design:type", String)
], Appointment.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'practitioner_id' }),
    __metadata("design:type", String)
], Appointment.prototype, "practitionerId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        default: AppointmentStatus.BOOKED
    }),
    __metadata("design:type", String)
], Appointment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], Appointment.prototype, "startAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], Appointment.prototype, "endAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Appointment.prototype, "room", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Appointment.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        default: UrgencyLevel.ROUTINE
    }),
    __metadata("design:type", String)
], Appointment.prototype, "urgency", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => practitioner_entity_1.Practitioner, (practitioner) => practitioner.appointments),
    (0, typeorm_1.JoinColumn)({ name: 'practitioner_id' }),
    __metadata("design:type", practitioner_entity_1.Practitioner)
], Appointment.prototype, "practitioner", void 0);
exports.Appointment = Appointment = __decorate([
    (0, typeorm_1.Entity)('appointments')
], Appointment);
//# sourceMappingURL=appointment.entity.js.map