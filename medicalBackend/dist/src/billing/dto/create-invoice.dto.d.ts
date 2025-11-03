import { BillingAddressDto } from './billing-address.dto';
export declare class CreateInvoiceDto {
    patientId: string;
    number?: string;
    dueAt?: Date;
    encounterId?: string;
    issueDate?: Date;
    billingAddress?: BillingAddressDto;
    notes?: string;
}
export declare class CreateInvoiceGqlDto {
    patientId: string;
    number?: string;
    dueAt?: Date;
    encounterId?: string;
    issueDate?: Date;
    billingAddress?: BillingAddressDto;
    notes?: string;
}
