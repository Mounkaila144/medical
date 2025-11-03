import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Invoice, InvoiceLine } from '../entities';
import { CreateInvoiceDto, AddInvoiceLineDto, UpdateInvoiceStatusDto } from '../dto';
import { MinioService } from '../../common/services/minio.service';
import { Tenant } from '../../auth/entities/tenant.entity';
export declare class InvoicingService {
    private invoiceRepository;
    private invoiceLineRepository;
    private tenantRepository;
    private eventEmitter;
    private minioService;
    private readonly bucketName;
    constructor(invoiceRepository: Repository<Invoice>, invoiceLineRepository: Repository<InvoiceLine>, tenantRepository: Repository<Tenant>, eventEmitter: EventEmitter2, minioService: MinioService);
    createDraft(tenantId: string, createInvoiceDto: CreateInvoiceDto): Promise<Invoice>;
    addLine(tenantId: string, addLineDto: AddInvoiceLineDto): Promise<Invoice>;
    send(tenantId: string, updateStatusDto: UpdateInvoiceStatusDto): Promise<Invoice>;
    markPaid(tenantId: string, updateStatusDto: UpdateInvoiceStatusDto): Promise<Invoice>;
    remindOverdue(tenantId: string): Promise<Invoice[]>;
    private recalculateTotal;
    findAll(tenantId: string): Promise<Invoice[]>;
    findOne(tenantId: string, id: string): Promise<Invoice>;
    generatePdf(invoiceId: string, tenantId: string): Promise<Invoice>;
    private generatePdfFiles;
    private generatePdfBuffer;
    downloadPdf(invoiceId: string, tenantId: string): Promise<Buffer>;
}
