import { Invoice } from '../entities/invoice.entity';
import { Payment } from '../entities/payment.entity';

export class InvoicePaidEvent {
  constructor(
    public readonly invoice: Invoice,
    public readonly payment: Payment
  ) {}
} 