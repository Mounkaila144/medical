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
exports.Invoice = exports.InvoiceStatus = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
const patient_entity_1 = require("../../patients/entities/patient.entity");
const invoice_line_entity_1 = require("./invoice-line.entity");
const payment_entity_1 = require("./payment.entity");
const billing_address_dto_1 = require("../dto/billing-address.dto");
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "DRAFT";
    InvoiceStatus["SENT"] = "SENT";
    InvoiceStatus["PAID"] = "PAID";
    InvoiceStatus["OVERDUE"] = "OVERDUE";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
(0, graphql_1.registerEnumType)(InvoiceStatus, {
    name: 'InvoiceStatus',
});
let Invoice = class Invoice {
    id;
    tenantId;
    patient;
    patientId;
    number;
    status;
    total;
    dueAt;
    encounterId;
    issueDate;
    billingAddress;
    notes;
    pdfPath;
    qr;
    lines;
    payments;
};
exports.Invoice = Invoice;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Invoice.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id' }),
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Invoice.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_entity_1.Patient),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    (0, graphql_1.Field)(() => patient_entity_1.Patient),
    __metadata("design:type", patient_entity_1.Patient)
], Invoice.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patient_id' }),
    __metadata("design:type", String)
], Invoice.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Invoice.prototype, "number", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: InvoiceStatus,
        default: InvoiceStatus.DRAFT,
    }),
    (0, graphql_1.Field)(() => InvoiceStatus),
    __metadata("design:type", String)
], Invoice.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], Invoice.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'due_at', nullable: true }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], Invoice.prototype, "dueAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'encounter_id', nullable: true }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "encounterId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'issue_date', nullable: true }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], Invoice.prototype, "issueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    (0, graphql_1.Field)(() => billing_address_dto_1.BillingAddress, { nullable: true }),
    __metadata("design:type", billing_address_dto_1.BillingAddress)
], Invoice.prototype, "billingAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pdf_path', nullable: true }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "pdfPath", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "qr", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => invoice_line_entity_1.InvoiceLine, (line) => line.invoice, { cascade: true }),
    (0, graphql_1.Field)(() => [invoice_line_entity_1.InvoiceLine], { nullable: true }),
    __metadata("design:type", Array)
], Invoice.prototype, "lines", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payment_entity_1.Payment, (payment) => payment.invoice, { cascade: true }),
    (0, graphql_1.Field)(() => [payment_entity_1.Payment], { nullable: true }),
    __metadata("design:type", Array)
], Invoice.prototype, "payments", void 0);
exports.Invoice = Invoice = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('invoices')
], Invoice);
//# sourceMappingURL=invoice.entity.js.map