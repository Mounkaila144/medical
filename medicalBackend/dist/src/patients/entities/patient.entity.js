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
exports.Patient = exports.Gender = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
const medical_history_item_entity_1 = require("./medical-history-item.entity");
const scanned_document_entity_1 = require("./scanned-document.entity");
const graphql_type_json_1 = require("graphql-type-json");
var Gender;
(function (Gender) {
    Gender["MALE"] = "M";
    Gender["FEMALE"] = "F";
    Gender["OTHER"] = "O";
})(Gender || (exports.Gender = Gender = {}));
let Patient = class Patient {
    id;
    clinicId;
    mrn;
    firstName;
    lastName;
    dob;
    gender;
    bloodType;
    phone;
    email;
    address;
    createdAt;
    updatedAt;
    deletedAt;
    medicalHistory;
    documents;
    generateMrn() {
        if (!this.mrn) {
            this.mrn = `MRN${Math.floor(10000000 + Math.random() * 90000000)}`;
        }
    }
};
exports.Patient = Patient;
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Patient.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ name: 'clinic_id', type: 'uuid' }),
    __metadata("design:type", String)
], Patient.prototype, "clinicId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Patient.prototype, "mrn", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ name: 'first_name' }),
    __metadata("design:type", String)
], Patient.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ name: 'last_name' }),
    __metadata("design:type", String)
], Patient.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Patient.prototype, "dob", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: Gender,
    }),
    __metadata("design:type", String)
], Patient.prototype, "gender", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ name: 'blood_type', nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "bloodType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "phone", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], Patient.prototype, "address", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Patient.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Patient.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', nullable: true }),
    __metadata("design:type", Date)
], Patient.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => medical_history_item_entity_1.MedicalHistoryItem, (item) => item.patient),
    __metadata("design:type", Array)
], Patient.prototype, "medicalHistory", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => scanned_document_entity_1.ScannedDocument, (document) => document.patient),
    __metadata("design:type", Array)
], Patient.prototype, "documents", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Patient.prototype, "generateMrn", null);
exports.Patient = Patient = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('patients')
], Patient);
//# sourceMappingURL=patient.entity.js.map