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
exports.Prescription = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
const encounter_entity_1 = require("./encounter.entity");
const practitioner_entity_1 = require("../../scheduling/entities/practitioner.entity");
const prescription_item_entity_1 = require("./prescription-item.entity");
let Prescription = class Prescription {
    id;
    encounter;
    encounterId;
    practitioner;
    practitionerId;
    pdfPath;
    qr;
    expiresAt;
    items;
};
exports.Prescription = Prescription;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Prescription.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => encounter_entity_1.Encounter, (encounter) => encounter.prescriptions),
    (0, typeorm_1.JoinColumn)({ name: 'encounter_id' }),
    (0, graphql_1.Field)(() => encounter_entity_1.Encounter),
    __metadata("design:type", encounter_entity_1.Encounter)
], Prescription.prototype, "encounter", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'encounter_id' }),
    __metadata("design:type", String)
], Prescription.prototype, "encounterId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => practitioner_entity_1.Practitioner),
    (0, typeorm_1.JoinColumn)({ name: 'practitioner_id' }),
    (0, graphql_1.Field)(() => practitioner_entity_1.Practitioner),
    __metadata("design:type", practitioner_entity_1.Practitioner)
], Prescription.prototype, "practitioner", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'practitioner_id' }),
    __metadata("design:type", String)
], Prescription.prototype, "practitionerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pdf_path', nullable: true }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Prescription.prototype, "pdfPath", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Prescription.prototype, "qr", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', nullable: true }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], Prescription.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => prescription_item_entity_1.PrescriptionItem, (item) => item.prescription, { cascade: true, eager: true }),
    (0, graphql_1.Field)(() => [prescription_item_entity_1.PrescriptionItem]),
    __metadata("design:type", Array)
], Prescription.prototype, "items", void 0);
exports.Prescription = Prescription = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('prescriptions')
], Prescription);
//# sourceMappingURL=prescription.entity.js.map