import { Patient } from '../../patients/entities/patient.entity';
import { InvoiceLine } from './invoice-line.entity';
import { Payment } from './payment.entity';
import { BillingAddress } from '../dto/billing-address.dto';
export declare enum InvoiceStatus {
    DRAFT = "DRAFT",
    SENT = "SENT",
    PAID = "PAID",
    OVERDUE = "OVERDUE"
}
export declare class Invoice {
    id: string;
    tenantId: string;
    patient: Patient;
    patientId: string;
    number: string;
    status: InvoiceStatus;
    total: number;
    dueAt: Date;
    encounterId: string;
    issueDate: Date;
    billingAddress: BillingAddress;
    notes: string;
    pdfPath: string;
    qr: string;
    lines: InvoiceLine[];
    payments: Payment[];
}
