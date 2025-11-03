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
exports.Encounter = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
const patient_entity_1 = require("../../patients/entities/patient.entity");
const practitioner_entity_1 = require("../../scheduling/entities/practitioner.entity");
const prescription_entity_1 = require("./prescription.entity");
const lab_result_entity_1 = require("./lab-result.entity");
let Encounter = class Encounter {
    id;
    tenantId;
    patient;
    patientId;
    practitioner;
    practitionerId;
    startAt;
    endAt;
    motive;
    exam;
    diagnosis;
    icd10Codes;
    locked;
    prescriptions;
    labResults;
};
exports.Encounter = Encounter;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Encounter.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Encounter.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_entity_1.Patient),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    (0, graphql_1.Field)(() => patient_entity_1.Patient),
    __metadata("design:type", patient_entity_1.Patient)
], Encounter.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patient_id' }),
    __metadata("design:type", String)
], Encounter.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => practitioner_entity_1.Practitioner),
    (0, typeorm_1.JoinColumn)({ name: 'practitioner_id' }),
    (0, graphql_1.Field)(() => practitioner_entity_1.Practitioner),
    __metadata("design:type", practitioner_entity_1.Practitioner)
], Encounter.prototype, "practitioner", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'practitioner_id' }),
    __metadata("design:type", String)
], Encounter.prototype, "practitionerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_at' }),
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Encounter.prototype, "startAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_at', nullable: true }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], Encounter.prototype, "endAt", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Encounter.prototype, "motive", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Encounter.prototype, "exam", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Encounter.prototype, "diagnosis", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], Encounter.prototype, "icd10Codes", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    (0, graphql_1.Field)({ defaultValue: false }),
    __metadata("design:type", Boolean)
], Encounter.prototype, "locked", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => prescription_entity_1.Prescription, (prescription) => prescription.encounter),
    (0, graphql_1.Field)(() => [prescription_entity_1.Prescription], { nullable: true }),
    __metadata("design:type", Array)
], Encounter.prototype, "prescriptions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => lab_result_entity_1.LabResult, (labResult) => labResult.encounter),
    (0, graphql_1.Field)(() => [lab_result_entity_1.LabResult], { nullable: true }),
    __metadata("design:type", Array)
], Encounter.prototype, "labResults", void 0);
exports.Encounter = Encounter = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('encounters')
], Encounter);
//# sourceMappingURL=encounter.entity.js.map