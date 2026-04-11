import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from '@nestjs/common';
import { InvoicingService } from '../services/invoicing.service';
import { Invoice, InvoiceLine, InvoiceStatus } from '../entities';
import { CreateInvoiceDto, AddInvoiceLineDto, UpdateInvoiceStatusDto } from '../dto';
import { Tenant } from '../../auth/entities/tenant.entity';
import { MinioService } from '../../common/services/minio.service';

describe('InvoicingService', () => {
  let service: InvoicingService;
  let invoiceRepository: Repository<Invoice>;
  let invoiceLineRepository: Repository<InvoiceLine>;
  let eventEmitter: EventEmitter2;

  const mockInvoiceRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockInvoiceLineRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockTenantRepository = {
    findOne: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const mockMinioService = {
    uploadBuffer: jest.fn(),
    getObject: jest.fn(),
    objectExists: jest.fn(),
    removeObject: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicingService,
        {
          provide: getRepositoryToken(Invoice),
          useValue: mockInvoiceRepository,
        },
        {
          provide: getRepositoryToken(InvoiceLine),
          useValue: mockInvoiceLineRepository,
        },
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockTenantRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: MinioService,
          useValue: mockMinioService,
        },
      ],
    }).compile();

    service = module.get<InvoicingService>(InvoicingService);
    invoiceRepository = module.get<Repository<Invoice>>(getRepositoryToken(Invoice));
    invoiceLineRepository = module.get<Repository<InvoiceLine>>(getRepositoryToken(InvoiceLine));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDraft', () => {
    it('should create a draft invoice with DRAFT status', async () => {
      const tenantId = 'tenant-1';
      const createInvoiceDto: CreateInvoiceDto = {
        patientId: 'patient-1',
        number: 'INV-001',
      };
      const invoice = {
        id: 'invoice-1',
        ...createInvoiceDto,
        tenantId,
        status: InvoiceStatus.DRAFT,
        dueAt: expect.any(Date),
        issueDate: expect.any(Date),
      };

      mockInvoiceRepository.create.mockReturnValue(invoice);
      mockInvoiceRepository.save.mockResolvedValue(invoice);

      const result = await service.createDraft(tenantId, createInvoiceDto);

      expect(mockInvoiceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId,
          patientId: 'patient-1',
          number: 'INV-001',
          status: InvoiceStatus.DRAFT,
        }),
      );
      expect(mockInvoiceRepository.save).toHaveBeenCalledWith(invoice);
      expect(result).toEqual(invoice);
    });

    it('should auto-generate invoice number when not provided', async () => {
      const tenantId = 'tenant-1';
      const createInvoiceDto: CreateInvoiceDto = {
        patientId: 'patient-1',
      };

      const invoice = {
        id: 'invoice-1',
        tenantId,
        patientId: 'patient-1',
        status: InvoiceStatus.DRAFT,
      };

      mockInvoiceRepository.create.mockReturnValue(invoice);
      mockInvoiceRepository.save.mockResolvedValue(invoice);

      await service.createDraft(tenantId, createInvoiceDto);

      expect(mockInvoiceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          number: expect.stringMatching(/^INV-\d+$/),
        }),
      );
    });

    it('should set default dueAt (30 days) when not provided', async () => {
      const tenantId = 'tenant-1';
      const createInvoiceDto: CreateInvoiceDto = {
        patientId: 'patient-1',
        number: 'INV-001',
      };

      const invoice = { id: 'invoice-1', tenantId, status: InvoiceStatus.DRAFT };
      mockInvoiceRepository.create.mockReturnValue(invoice);
      mockInvoiceRepository.save.mockResolvedValue(invoice);

      await service.createDraft(tenantId, createInvoiceDto);

      expect(mockInvoiceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          dueAt: expect.any(Date),
        }),
      );
    });
  });

  describe('addLine', () => {
    it('should add a line and recalculate totals', async () => {
      const tenantId = 'tenant-1';
      const invoiceId = 'invoice-1';
      const addLineDto: AddInvoiceLineDto = {
        invoiceId,
        description: 'Consultation',
        qty: 1,
        unitPrice: 100,
        thirdPartyRate: 30,
        tax: 20,
      };

      const invoiceLineWithoutId = {
        invoiceId,
        description: 'Consultation',
        qty: 1,
        unitPrice: 100,
        thirdPartyRate: 30,
        tax: 20,
      };

      const invoiceLine = {
        id: 'line-1',
        ...invoiceLineWithoutId,
      };

      const invoice = {
        id: invoiceId,
        tenantId,
        status: InvoiceStatus.DRAFT,
        lines: [],
      };

      const updatedInvoice = {
        ...invoice,
        lines: [invoiceLine],
        total: 84, // 100 - (100*0.3) + ((100-30)*0.2) = 70 + 14 = 84
      };

      mockInvoiceRepository.findOne.mockResolvedValueOnce(invoice);
      mockInvoiceLineRepository.create.mockReturnValue(invoiceLineWithoutId);
      mockInvoiceLineRepository.save.mockResolvedValue(invoiceLine);
      mockInvoiceRepository.findOne.mockResolvedValueOnce({
        ...invoice,
        lines: [invoiceLine],
      });
      mockInvoiceRepository.save.mockResolvedValue(updatedInvoice);

      const result = await service.addLine(tenantId, addLineDto);

      expect(mockInvoiceRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockInvoiceLineRepository.create).toHaveBeenCalledWith(invoiceLineWithoutId);
      expect(mockInvoiceLineRepository.save).toHaveBeenCalledWith(invoiceLineWithoutId);
      expect(mockInvoiceRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          total: 84,
        }),
      );
      expect(result).toEqual(updatedInvoice);
    });

    it('should calculate total correctly with multiple lines', async () => {
      const tenantId = 'tenant-1';
      const invoiceId = 'invoice-1';

      const existingLine = {
        id: 'line-1',
        invoiceId,
        description: 'Consultation',
        qty: 1,
        unitPrice: 100,
        thirdPartyRate: 30,
        tax: 20,
      };

      const newLineDto: AddInvoiceLineDto = {
        invoiceId,
        description: 'Médicaments',
        qty: 2,
        unitPrice: 50,
        thirdPartyRate: 0,
        tax: 10,
      };

      const newLineWithoutId = {
        invoiceId,
        description: 'Médicaments',
        qty: 2,
        unitPrice: 50,
        thirdPartyRate: 0,
        tax: 10,
      };

      const newLine = {
        id: 'line-2',
        ...newLineWithoutId,
      };

      const invoice = {
        id: invoiceId,
        tenantId,
        status: InvoiceStatus.DRAFT,
        lines: [existingLine],
      };

      const updatedInvoice = {
        ...invoice,
        lines: [existingLine, newLine],
        total: 194, // 84 (first line) + 110 (second: 100 + 10) = 194
      };

      mockInvoiceRepository.findOne.mockResolvedValueOnce(invoice);
      mockInvoiceLineRepository.create.mockReturnValue(newLineWithoutId);
      mockInvoiceLineRepository.save.mockResolvedValue(newLine);
      mockInvoiceRepository.findOne.mockResolvedValueOnce({
        ...invoice,
        lines: [existingLine, newLine],
      });
      mockInvoiceRepository.save.mockResolvedValue(updatedInvoice);

      const result = await service.addLine(tenantId, newLineDto);

      expect(mockInvoiceRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          total: 194,
        }),
      );
      expect(result).toEqual(updatedInvoice);
    });

    it('should throw NotFoundException when invoice not found', async () => {
      mockInvoiceRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addLine('tenant-1', {
          invoiceId: 'non-existent',
          description: 'Test',
          qty: 1,
          unitPrice: 100,
          thirdPartyRate: 0,
          tax: 0,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error when invoice is not in DRAFT status', async () => {
      const invoice = {
        id: 'invoice-1',
        tenantId: 'tenant-1',
        status: InvoiceStatus.SENT,
        lines: [],
      };
      mockInvoiceRepository.findOne.mockResolvedValue(invoice);

      await expect(
        service.addLine('tenant-1', {
          invoiceId: 'invoice-1',
          description: 'Test',
          qty: 1,
          unitPrice: 100,
          thirdPartyRate: 0,
          tax: 0,
        }),
      ).rejects.toThrow('Cannot add lines to an invoice that is not in DRAFT status');
    });
  });

  describe('send', () => {
    it('should change status to SENT and emit event', async () => {
      const tenantId = 'tenant-1';
      const invoice = {
        id: 'invoice-1',
        tenantId,
        status: InvoiceStatus.DRAFT,
        lines: [{ id: 'line-1', description: 'Consultation' }],
        patient: { id: 'patient-1', firstName: 'Test' },
      };

      const sentInvoice = { ...invoice, status: InvoiceStatus.SENT };

      mockInvoiceRepository.findOne.mockResolvedValue(invoice);
      mockInvoiceRepository.save.mockResolvedValue(sentInvoice);

      const result = await service.send(tenantId, {
        invoiceId: 'invoice-1',
        status: InvoiceStatus.SENT,
      });

      expect(result.status).toBe(InvoiceStatus.SENT);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'invoice.sent',
        expect.any(Object),
      );
    });

    it('should throw NotFoundException when invoice not found', async () => {
      mockInvoiceRepository.findOne.mockResolvedValue(null);

      await expect(
        service.send('tenant-1', {
          invoiceId: 'non-existent',
          status: InvoiceStatus.SENT,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error when invoice is not in DRAFT status', async () => {
      const invoice = {
        id: 'invoice-1',
        tenantId: 'tenant-1',
        status: InvoiceStatus.PAID,
        lines: [{ id: 'line-1' }],
      };
      mockInvoiceRepository.findOne.mockResolvedValue(invoice);

      await expect(
        service.send('tenant-1', {
          invoiceId: 'invoice-1',
          status: InvoiceStatus.SENT,
        }),
      ).rejects.toThrow('Only invoices in DRAFT status can be sent');
    });

    it('should throw error when invoice has no lines', async () => {
      const invoice = {
        id: 'invoice-1',
        tenantId: 'tenant-1',
        status: InvoiceStatus.DRAFT,
        lines: [],
      };
      mockInvoiceRepository.findOne.mockResolvedValue(invoice);

      await expect(
        service.send('tenant-1', {
          invoiceId: 'invoice-1',
          status: InvoiceStatus.SENT,
        }),
      ).rejects.toThrow('Cannot send an invoice without lines');
    });
  });

  describe('markPaid', () => {
    it('should change status to PAID', async () => {
      const tenantId = 'tenant-1';
      const invoice = {
        id: 'invoice-1',
        tenantId,
        status: InvoiceStatus.SENT,
      };

      const paidInvoice = { ...invoice, status: InvoiceStatus.PAID };

      mockInvoiceRepository.findOne.mockResolvedValue(invoice);
      mockInvoiceRepository.save.mockResolvedValue(paidInvoice);

      const result = await service.markPaid(tenantId, {
        invoiceId: 'invoice-1',
        status: InvoiceStatus.PAID,
      });

      expect(result.status).toBe(InvoiceStatus.PAID);
      expect(mockInvoiceRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: InvoiceStatus.PAID }),
      );
    });

    it('should throw NotFoundException when invoice not found', async () => {
      mockInvoiceRepository.findOne.mockResolvedValue(null);

      await expect(
        service.markPaid('tenant-1', {
          invoiceId: 'non-existent',
          status: InvoiceStatus.PAID,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all invoices for a tenant', async () => {
      const invoices = [
        { id: '1', tenantId: 'tenant-1', status: InvoiceStatus.DRAFT },
        { id: '2', tenantId: 'tenant-1', status: InvoiceStatus.SENT },
      ];
      mockInvoiceRepository.find.mockResolvedValue(invoices);

      const result = await service.findAll('tenant-1');

      expect(mockInvoiceRepository.find).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        relations: ['patient', 'lines'],
        order: { issueDate: 'DESC' },
      });
      expect(result).toEqual(invoices);
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should return a specific invoice by id and tenantId', async () => {
      const invoice = {
        id: 'invoice-1',
        tenantId: 'tenant-1',
        status: InvoiceStatus.DRAFT,
      };
      mockInvoiceRepository.findOne.mockResolvedValue(invoice);

      const result = await service.findOne('tenant-1', 'invoice-1');

      expect(mockInvoiceRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'invoice-1', tenantId: 'tenant-1' },
        relations: ['patient', 'lines', 'payments'],
      });
      expect(result).toEqual(invoice);
    });

    it('should throw NotFoundException when invoice not found', async () => {
      mockInvoiceRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('tenant-1', 'non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
