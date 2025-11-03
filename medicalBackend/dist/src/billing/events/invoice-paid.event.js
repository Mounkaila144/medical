"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicePaidEvent = void 0;
class InvoicePaidEvent {
    invoice;
    payment;
    constructor(invoice, payment) {
        this.invoice = invoice;
        this.payment = payment;
    }
}
exports.InvoicePaidEvent = InvoicePaidEvent;
//# sourceMappingURL=invoice-paid.event.js.map