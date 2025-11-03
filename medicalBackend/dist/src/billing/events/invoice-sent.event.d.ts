import { Invoice } from '../entities/invoice.entity';
export declare class InvoiceSentEvent {
    readonly invoice: Invoice;
    constructor(invoice: Invoice);
}
