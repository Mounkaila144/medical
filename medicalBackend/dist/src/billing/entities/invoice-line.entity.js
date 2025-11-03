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
exports.InvoiceLine = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
const invoice_entity_1 = require("./invoice.entity");
let InvoiceLine = class InvoiceLine {
    id;
    invoice;
    invoiceId;
    description;
    qty;
    unitPrice;
    thirdPartyRate;
    tax;
};
exports.InvoiceLine = InvoiceLine;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], InvoiceLine.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => invoice_entity_1.Invoice, (invoice) => invoice.lines, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'invoice_id' }),
    (0, graphql_1.Field)(() => invoice_entity_1.Invoice),
    __metadata("design:type", invoice_entity_1.Invoice)
], InvoiceLine.prototype, "invoice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_id' }),
    __metadata("design:type", String)
], InvoiceLine.prototype, "invoiceId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], InvoiceLine.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], InvoiceLine.prototype, "qty", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 }),
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], InvoiceLine.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'third_party_rate', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], InvoiceLine.prototype, "thirdPartyRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], InvoiceLine.prototype, "tax", void 0);
exports.InvoiceLine = InvoiceLine = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('invoice_lines')
], InvoiceLine);
//# sourceMappingURL=invoice-line.entity.js.map