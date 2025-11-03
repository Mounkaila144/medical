import { Response } from 'express';
import { InvoicingService } from '../services/invoicing.service';
import { CreateInvoiceDto, AddInvoiceLineDto, UpdateInvoiceStatusDto } from '../dto';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from '../entities/invoice.entity';
export declare class InvoicesController {
    private readonly invoicingService;
    private invoiceRepository;
    constructor(invoicingService: InvoicingService, invoiceRepository: Repository<Invoice>);
    createDraft(createInvoiceDto: CreateInvoiceDto, req: any): Promise<Invoice>;
    addLine(addLineDto: AddInvoiceLineDto, req: any): Promise<Invoice>;
    sendInvoice(id: string, data: any, req: any): Promise<Invoice>;
    send(updateStatusDto: UpdateInvoiceStatusDto, req: any): Promise<Invoice>;
    markPaid(updateStatusDto: UpdateInvoiceStatusDto, req: any): Promise<Invoice>;
    remindOverdue(req: any): Promise<Invoice[]>;
    findAll(req: any, patientId?: string, status?: InvoiceStatus): Promise<Invoice[]>;
    findOne(id: string, req: any): Promise<Invoice | null>;
    update(id: string, updateInvoiceDto: Partial<CreateInvoiceDto>, req: any): Promise<Invoice | null>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    downloadPdf(id: string, req: any, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    regeneratePdf(id: string, req: any): Promise<{
        message: string;
    }>;
}
