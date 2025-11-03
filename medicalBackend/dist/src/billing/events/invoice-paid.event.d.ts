import { Invoice } from '../entities/invoice.entity';
import { Payment } from '../entities/payment.entity';
export declare class InvoicePaidEvent {
    readonly invoice: Invoice;
    readonly payment: Payment;
    constructor(invoice: Invoice, payment: Payment);
}
