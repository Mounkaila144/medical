import { Invoice } from '../entities/invoice.entity';

export class InvoiceSentEvent {
  constructor(public readonly invoice: Invoice) {}
} 