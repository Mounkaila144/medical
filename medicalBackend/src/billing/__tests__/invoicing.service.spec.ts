import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InvoicingService } from '../services/invoicing.service';
import { Invoice, InvoiceLine, InvoiceStatus } from '../entities';
import { CreateInvoiceDto, AddInvoiceLineDto } from '../dto';

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

  const mockEventEmitter = {
    emit: jest.fn(),
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
          provide: EventEmitter2,
          useValue: mockEventEmitter,
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
    it('should create a draft invoice', async () => {
      const tenantId = 'tenant-1';
      const createInvoiceDto: CreateInvoiceDto = {
        patientId: 'patient-1',
        number: 'INV-001',
      };
      const invoice = { id: 'invoice-1', ...createInvoiceDto, tenantId, status: InvoiceStatus.DRAFT };

      mockInvoiceRepository.create.mockReturnValue(invoice);
      mockInvoiceRepository.save.mockResolvedValue(invoice);

      const result = await service.createDraft(tenantId, createInvoiceDto);

      expect(mockInvoiceRepository.create).toHaveBeenCalled();
      expect(mockInvoiceRepository.save).toHaveBeenCalledWith(invoice);
      expect(result).toEqual(invoice);
    });
  });

  describe('addLine', () => {
    it('should add a line and recalculate total', async () => {
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
      
      // Création de l'objet line sans id (comme le fait le service)
      const invoiceLineWithoutId = {
        invoiceId,
        description: 'Consultation',
        qty: 1,
        unitPrice: 100,
        thirdPartyRate: 30,
        tax: 20,
      };
      
      // L'objet retourné par le repository.save() aura un id
      const invoiceLine = {
        id: 'line-1',
        ...invoiceLineWithoutId
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
      expect(mockInvoiceRepository.save).toHaveBeenCalledWith({
        ...invoice,
        lines: [invoiceLine],
        total: 84,
      });
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
        ...newLineWithoutId
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
        total: 194, // 84 (first line) + (2*50) + ((2*50)*0.1) = 84 + 100 + 10 = 194
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

      expect(mockInvoiceRepository.save).toHaveBeenCalledWith({
        ...invoice,
        lines: [existingLine, newLine],
        total: 194,
      });
      expect(result).toEqual(updatedInvoice);
    });
  });
}); 