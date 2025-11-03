import { PaymentMethod } from '../entities/payment.entity';
export declare class CreatePaymentDto {
    invoiceId: string;
    amount: number;
    method: PaymentMethod;
    reference?: string;
    paidAt?: string;
    notes?: string;
    currency?: string;
}
export declare class CreatePaymentGqlDto {
    invoiceId: string;
    amount: number;
    method: PaymentMethod;
    reference?: string;
}
