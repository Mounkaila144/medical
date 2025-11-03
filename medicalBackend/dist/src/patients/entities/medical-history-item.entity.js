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
exports.MedicalHistoryItem = exports.MedicalHistoryType = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
const patient_entity_1 = require("./patient.entity");
var MedicalHistoryType;
(function (MedicalHistoryType) {
    MedicalHistoryType["ANTECEDENT"] = "ANTECEDENT";
    MedicalHistoryType["ALLERGY"] = "ALLERGY";
    MedicalHistoryType["VACCINE"] = "VACCINE";
})(MedicalHistoryType || (exports.MedicalHistoryType = MedicalHistoryType = {}));
let MedicalHistoryItem = class MedicalHistoryItem {
    id;
    patientId;
    type;
    label;
    note;
    recordedAt;
    patient;
};
exports.MedicalHistoryItem = MedicalHistoryItem;
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MedicalHistoryItem.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ name: 'patient_id', type: 'uuid' }),
    __metadata("design:type", String)
], MedicalHistoryItem.prototype, "patientId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MedicalHistoryType,
    }),
    __metadata("design:type", String)
], MedicalHistoryItem.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MedicalHistoryItem.prototype, "label", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], MedicalHistoryItem.prototype, "note", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ name: 'recorded_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], MedicalHistoryItem.prototype, "recordedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_entity_1.Patient, (patient) => patient.medicalHistory, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", patient_entity_1.Patient)
], MedicalHistoryItem.prototype, "patient", void 0);
exports.MedicalHistoryItem = MedicalHistoryItem = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('medical_history_items')
], MedicalHistoryItem);
//# sourceMappingURL=medical-history-item.entity.js.map