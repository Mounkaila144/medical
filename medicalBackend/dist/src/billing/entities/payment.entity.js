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
exports.Payment = exports.PaymentMethod = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
const invoice_entity_1 = require("./invoice.entity");
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["CARD"] = "CARD";
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethod["CHECK"] = "CHECK";
    PaymentMethod["INSURANCE"] = "INSURANCE";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
(0, graphql_1.registerEnumType)(PaymentMethod, {
    name: 'PaymentMethod',
});
let Payment = class Payment {
    id;
    invoice;
    invoiceId;
    amount;
    method;
    paidAt;
    reference;
};
exports.Payment = Payment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Payment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => invoice_entity_1.Invoice, (invoice) => invoice.payments, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'invoice_id' }),
    (0, graphql_1.Field)(() => invoice_entity_1.Invoice),
    __metadata("design:type", invoice_entity_1.Invoice)
], Payment.prototype, "invoice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_id' }),
    __metadata("design:type", String)
], Payment.prototype, "invoiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], Payment.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PaymentMethod,
        default: PaymentMethod.CASH,
    }),
    (0, graphql_1.Field)(() => PaymentMethod),
    __metadata("design:type", String)
], Payment.prototype, "method", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'paid_at' }),
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Payment.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "reference", void 0);
exports.Payment = Payment = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('payments')
], Payment);
//# sourceMappingURL=payment.entity.js.map