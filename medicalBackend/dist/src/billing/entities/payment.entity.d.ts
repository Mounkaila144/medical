import { Invoice } from './invoice.entity';
export declare enum PaymentMethod {
    CASH = "CASH",
    CARD = "CARD",
    BANK_TRANSFER = "BANK_TRANSFER",
    CHECK = "CHECK",
    INSURANCE = "INSURANCE"
}
export declare class Payment {
    id: string;
    invoice: Invoice;
    invoiceId: string;
    amount: number;
    method: PaymentMethod;
    paidAt: Date;
    reference: string;
}
