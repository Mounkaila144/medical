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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const entities_1 = require("../entities");
const events_1 = require("../events");
let PaymentsService = class PaymentsService {
    paymentRepository;
    invoiceRepository;
    eventEmitter;
    constructor(paymentRepository, invoiceRepository, eventEmitter) {
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
        this.eventEmitter = eventEmitter;
    }
    async recordPayment(tenantId, createPaymentDto) {
        const invoice = await this.invoiceRepository.findOne({
            where: { id: createPaymentDto.invoiceId, tenantId },
            relations: ['payments'],
        });
        if (!invoice) {
            throw new common_1.NotFoundException(`Invoice with ID ${createPaymentDto.invoiceId} not found`);
        }
        if (invoice.status === entities_1.InvoiceStatus.PAID) {
            throw new Error('Invoice is already paid');
        }
        let totalPaid = 0;
        if (invoice.payments && invoice.payments.length > 0) {
            totalPaid = invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
        }
        const payment = this.paymentRepository.create({
            invoiceId: invoice.id,
            amount: createPaymentDto.amount,
            method: createPaymentDto.method,
            paidAt: new Date(),
            reference: createPaymentDto.reference,
        });
        const savedPayment = await this.paymentRepository.save(payment);
        const newTotalPaid = totalPaid + Number(createPaymentDto.amount);
        if (newTotalPaid >= Number(invoice.total)) {
            invoice.status = entities_1.InvoiceStatus.PAID;
            await this.invoiceRepository.save(invoice);
            this.eventEmitter.emit('invoice.paid', new events_1.InvoicePaidEvent(invoice, savedPayment));
        }
        return savedPayment;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Payment)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Invoice)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map