import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from '@nestjs/common';

import { PrescriptionsService } from '../services/prescriptions.service';
import { Prescription } from '../entities/prescription.entity';
import { PrescriptionItem } from '../entities/prescription-item.entity';
import { EncountersService } from '../services/encounters.service';
import { MinioService } from '../../common/services/minio.service';
import { Tenant } from '../../auth/entities/tenant.entity';

describe('PrescriptionsService', () => {
  let service: PrescriptionsService;

  const tenantId = 'tenant-123';

  const mockPrescriptionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockPrescriptionItemRepository = {
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockTenantRepository = {
    findOne: jest.fn(),
  };

  const mockEncountersService = {
    findOne: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const mockMinioService = {
    uploadBuffer: jest.fn().mockResolvedValue(undefined),
    objectExists: jest.fn().mockResolvedValue(false),
    removeObject: jest.fn().mockResolvedValue(undefined),
    getObject: jest.fn(),
  };

  const mockEncounter = {
    id: 'encounter-1',
    tenantId,
    patientId: 'patient-1',
    practitionerId: 'practitioner-1',
    patient: {
      id: 'patient-1',
      firstName: 'Jean',
      lastName: 'Dupont',
      mrn: 'MRN001',
    },
    practitioner: {
      id: 'practitioner-1',
      firstName: 'Dr. Marie',
      lastName: 'Curie',
    },
  };

  const mockPrescription = {
    id: 'prescription-1',
    encounterId: 'encounter-1',
    practitionerId: 'practitioner-1',
    expiresAt: new Date('2024-01-15'),
    pdfPath: null,
    qr: null,
    items: [],
    encounter: mockEncounter,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrescriptionsService,
        {
          provide: getRepositoryToken(Prescription),
          useValue: mockPrescriptionRepository,
        },
        {
          provide: getRepositoryToken(PrescriptionItem),
          useValue: mockPrescriptionItemRepository,
        },
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockTenantRepository,
        },
        {
          provide: EncountersService,
          useValue: mockEncountersService,
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

    service = module.get<PrescriptionsService>(PrescriptionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create prescription with items and verify encounter tenant', async () => {
      const createDto = {
        encounterId: 'encounter-1',
        practitionerId: 'practitioner-1',
        expiresAt: new Date('2024-01-15'),
        items: [
          {
            medication: 'Paracétamol',
            dosage: '500mg',
            frequency: '3 fois par jour',
            duration: '7 jours',
            instructions: 'Après les repas',
          },
          {
            medication: 'Amoxicilline',
            dosage: '1g',
            frequency: '2 fois par jour',
            duration: '5 jours',
          },
        ],
      };

      // Encounter belongs to the right tenant
      mockEncountersService.findOne.mockResolvedValue(mockEncounter);

      // Create prescription
      const savedPrescription = {
        id: 'prescription-1',
        encounterId: 'encounter-1',
        practitionerId: 'practitioner-1',
        expiresAt: createDto.expiresAt,
        pdfPath: null,
        qr: null,
      };
      mockPrescriptionRepository.create.mockReturnValue(savedPrescription);
      mockPrescriptionRepository.save
        .mockResolvedValueOnce(savedPrescription) // first save
        .mockResolvedValueOnce({ ...savedPrescription, pdfPath: 'path/pdf', qr: 'path/qr' }); // after PDF generation

      // Create items
      const items = createDto.items.map((item, i) => ({
        id: `item-${i}`,
        prescriptionId: 'prescription-1',
        ...item,
      }));
      mockPrescriptionItemRepository.create
        .mockReturnValueOnce(items[0])
        .mockReturnValueOnce(items[1]);
      mockPrescriptionItemRepository.save.mockResolvedValue(items);

      // Tenant for PDF generation
      mockTenantRepository.findOne.mockResolvedValue({ id: tenantId, name: 'Clinic Test' });

      const result = await service.create(tenantId, createDto);

      expect(mockEncountersService.findOne).toHaveBeenCalledWith('encounter-1');
      expect(mockPrescriptionRepository.create).toHaveBeenCalledWith({
        encounterId: 'encounter-1',
        practitionerId: 'practitioner-1',
        expiresAt: createDto.expiresAt,
      });
      expect(mockPrescriptionRepository.save).toHaveBeenCalled();
      expect(mockPrescriptionItemRepository.create).toHaveBeenCalledTimes(2);
      expect(mockPrescriptionItemRepository.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'prescription.generated',
        expect.any(Object),
      );
    });

    it('should throw NotFoundException when encounter belongs to different tenant', async () => {
      const createDto = {
        encounterId: 'encounter-1',
        practitionerId: 'practitioner-1',
        items: [
          {
            medication: 'Paracétamol',
            dosage: '500mg',
            frequency: '3 fois par jour',
          },
        ],
      };

      // Encounter belongs to a different tenant
      mockEncountersService.findOne.mockResolvedValue({
        ...mockEncounter,
        tenantId: 'different-tenant',
      });

      await expect(service.create(tenantId, createDto)).rejects.toThrow(NotFoundException);
    });

    it('should use default expiration (30 days) when not provided', async () => {
      const createDto = {
        encounterId: 'encounter-1',
        practitionerId: 'practitioner-1',
        items: [
          {
            medication: 'Paracétamol',
            dosage: '500mg',
            frequency: '3 fois par jour',
          },
        ],
      };

      mockEncountersService.findOne.mockResolvedValue(mockEncounter);

      const defaultExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const savedPrescription = {
        id: 'prescription-1',
        encounterId: 'encounter-1',
        practitionerId: 'practitioner-1',
        expiresAt: defaultExpiry,
        pdfPath: null,
        qr: null,
        encounter: mockEncounter,
      };
      mockPrescriptionRepository.create.mockReturnValue(savedPrescription);
      mockPrescriptionRepository.save
        .mockResolvedValueOnce(savedPrescription)
        .mockResolvedValueOnce({ ...savedPrescription, pdfPath: 'path/pdf', qr: 'path/qr' });
      mockPrescriptionItemRepository.create.mockReturnValue({});
      mockPrescriptionItemRepository.save.mockResolvedValue([]);
      mockTenantRepository.findOne.mockResolvedValue({ id: tenantId, name: 'Clinic' });

      await service.create(tenantId, createDto);

      expect(mockPrescriptionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          expiresAt: expect.any(Date),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should filter via encounter.tenantId when tenantId is provided', async () => {
      const queryBuilderMock = {
        innerJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockPrescription),
      };

      mockPrescriptionRepository.createQueryBuilder.mockReturnValue(queryBuilderMock);

      const result = await service.findOne('prescription-1', tenantId);

      expect(mockPrescriptionRepository.createQueryBuilder).toHaveBeenCalledWith('prescription');
      expect(queryBuilderMock.innerJoin).toHaveBeenCalledWith('prescription.encounter', 'encounter');
      expect(queryBuilderMock.where).toHaveBeenCalledWith('prescription.id = :id', { id: 'prescription-1' });
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith('encounter.tenantId = :tenantId', { tenantId });
      expect(result).toEqual(mockPrescription);
    });

    it('should find prescription without tenantId filter', async () => {
      mockPrescriptionRepository.findOne.mockResolvedValue(mockPrescription);

      const result = await service.findOne('prescription-1');

      expect(mockPrescriptionRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'prescription-1' },
        relations: ['encounter', 'practitioner', 'encounter.patient', 'items'],
      });
      expect(result).toEqual(mockPrescription);
    });

    it('should throw NotFoundException when prescription not found with tenantId', async () => {
      const queryBuilderMock = {
        innerJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      mockPrescriptionRepository.createQueryBuilder.mockReturnValue(queryBuilderMock);

      await expect(service.findOne('non-existent', tenantId)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when prescription not found without tenantId', async () => {
      mockPrescriptionRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should join encounter to filter by tenant', async () => {
      const prescriptions = [mockPrescription];
      const queryBuilderMock = {
        innerJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(prescriptions),
      };

      mockPrescriptionRepository.createQueryBuilder.mockReturnValue(queryBuilderMock);

      const result = await service.findAll(tenantId);

      expect(mockPrescriptionRepository.createQueryBuilder).toHaveBeenCalledWith('prescription');
      expect(queryBuilderMock.innerJoin).toHaveBeenCalledWith('prescription.encounter', 'encounter');
      expect(queryBuilderMock.where).toHaveBeenCalledWith('encounter.tenantId = :tenantId', { tenantId });
      expect(queryBuilderMock.getMany).toHaveBeenCalled();
      expect(result).toEqual(prescriptions);
    });

    it('should return empty array when no prescriptions exist for tenant', async () => {
      const queryBuilderMock = {
        innerJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockPrescriptionRepository.createQueryBuilder.mockReturnValue(queryBuilderMock);

      const result = await service.findAll(tenantId);

      expect(result).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should remove items and prescription', async () => {
      const queryBuilderMock = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({
          ...mockPrescription,
          pdfPath: null,
          qr: null,
        }),
      };

      mockPrescriptionRepository.createQueryBuilder.mockReturnValue(queryBuilderMock);
      mockPrescriptionItemRepository.delete.mockResolvedValue({ affected: 2 });
      mockPrescriptionRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete('prescription-1', tenantId);

      expect(queryBuilderMock.where).toHaveBeenCalledWith('prescription.id = :id', { id: 'prescription-1' });
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith('encounter.tenantId = :tenantId', { tenantId });
      expect(mockPrescriptionItemRepository.delete).toHaveBeenCalledWith({ prescriptionId: 'prescription-1' });
      expect(mockPrescriptionRepository.delete).toHaveBeenCalledWith('prescription-1');
    });

    it('should throw NotFoundException when prescription not found', async () => {
      const queryBuilderMock = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      mockPrescriptionRepository.createQueryBuilder.mockReturnValue(queryBuilderMock);

      await expect(service.delete('non-existent', tenantId)).rejects.toThrow(NotFoundException);
    });

    it('should clean up MinIO files when they exist', async () => {
      const prescriptionWithFiles = {
        ...mockPrescription,
        pdfPath: 'tenant-123/prescriptions/pdf/prescription-1.pdf',
        qr: 'tenant-123/prescriptions/qr/prescription-1.png',
      };

      const queryBuilderMock = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(prescriptionWithFiles),
      };

      mockPrescriptionRepository.createQueryBuilder.mockReturnValue(queryBuilderMock);
      mockMinioService.objectExists.mockResolvedValue(true);
      mockPrescriptionItemRepository.delete.mockResolvedValue({ affected: 1 });
      mockPrescriptionRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete('prescription-1', tenantId);

      expect(mockMinioService.objectExists).toHaveBeenCalledTimes(2);
      expect(mockMinioService.removeObject).toHaveBeenCalledWith(
        'medical-prescriptions',
        'tenant-123/prescriptions/pdf/prescription-1.pdf',
      );
      expect(mockMinioService.removeObject).toHaveBeenCalledWith(
        'medical-prescriptions',
        'tenant-123/prescriptions/qr/prescription-1.png',
      );
    });

    it('should not fail when MinIO cleanup errors', async () => {
      const prescriptionWithFiles = {
        ...mockPrescription,
        pdfPath: 'some/path.pdf',
        qr: 'some/qr.png',
      };

      const queryBuilderMock = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(prescriptionWithFiles),
      };

      mockPrescriptionRepository.createQueryBuilder.mockReturnValue(queryBuilderMock);
      mockMinioService.objectExists.mockRejectedValue(new Error('MinIO unavailable'));
      mockPrescriptionItemRepository.delete.mockResolvedValue({ affected: 1 });
      mockPrescriptionRepository.delete.mockResolvedValue({ affected: 1 });

      // Should not throw
      await service.delete('prescription-1', tenantId);

      // Items and prescription should still be deleted
      expect(mockPrescriptionItemRepository.delete).toHaveBeenCalled();
      expect(mockPrescriptionRepository.delete).toHaveBeenCalled();
    });
  });
});
