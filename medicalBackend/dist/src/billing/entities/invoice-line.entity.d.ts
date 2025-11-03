import { Invoice } from './invoice.entity';
export declare class InvoiceLine {
    id: string;
    invoice: Invoice;
    invoiceId: string;
    description: string;
    qty: number;
    unitPrice: number;
    thirdPartyRate: number;
    tax: number;
}
