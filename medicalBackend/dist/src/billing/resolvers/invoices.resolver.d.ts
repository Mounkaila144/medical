import { Repository } from 'typeorm';
import { Invoice } from '../entities';
import { InvoicingService } from '../services';
import { CreateInvoiceGqlDto, AddInvoiceLineGqlDto, UpdateInvoiceStatusDto } from '../dto';
export declare class InvoicesResolver {
    private invoiceRepository;
    private invoicingService;
    constructor(invoiceRepository: Repository<Invoice>, invoicingService: InvoicingService);
    invoices(context: any): Promise<Invoice[]>;
    invoice(id: string, context: any): Promise<Invoice | null>;
    createInvoice(createInvoiceDto: CreateInvoiceGqlDto, context: any): Promise<Invoice>;
    addInvoiceLine(addLineDto: AddInvoiceLineGqlDto, context: any): Promise<Invoice>;
    sendInvoice(updateStatusDto: UpdateInvoiceStatusDto, context: any): Promise<Invoice>;
    markInvoicePaid(updateStatusDto: UpdateInvoiceStatusDto, context: any): Promise<Invoice>;
    remindOverdueInvoices(context: any): Promise<Invoice[]>;
}
