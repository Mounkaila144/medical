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
exports.LabResult = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = require("graphql-type-json");
const patient_entity_1 = require("../../patients/entities/patient.entity");
const encounter_entity_1 = require("./encounter.entity");
let LabResult = class LabResult {
    id;
    tenantId;
    patient;
    patientId;
    encounter;
    encounterId;
    labName;
    result;
    filePath;
    receivedAt;
};
exports.LabResult = LabResult;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], LabResult.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], LabResult.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_entity_1.Patient),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    (0, graphql_1.Field)(() => patient_entity_1.Patient),
    __metadata("design:type", patient_entity_1.Patient)
], LabResult.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patient_id' }),
    __metadata("design:type", String)
], LabResult.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => encounter_entity_1.Encounter, (encounter) => encounter.labResults, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'encounter_id' }),
    (0, graphql_1.Field)(() => encounter_entity_1.Encounter, { nullable: true }),
    __metadata("design:type", encounter_entity_1.Encounter)
], LabResult.prototype, "encounter", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'encounter_id', nullable: true }),
    __metadata("design:type", String)
], LabResult.prototype, "encounterId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lab_name' }),
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], LabResult.prototype, "labName", void 0);
__decorate([
    (0, typeorm_1.Column)('json'),
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON),
    __metadata("design:type", Object)
], LabResult.prototype, "result", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_path', nullable: true }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], LabResult.prototype, "filePath", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'received_at' }),
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], LabResult.prototype, "receivedAt", void 0);
exports.LabResult = LabResult = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('lab_results')
], LabResult);
//# sourceMappingURL=lab-result.entity.js.map