import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { LabResultsService } from '../services/lab-results.service';
import { LabResult } from '../entities/lab-result.entity';
import { CreateLabResultDto } from '../dto/create-lab-result.dto';

describe('LabResultsService', () => {
  let service: LabResultsService;
  let repository: Repository<LabResult>;

  const mockLabResultRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const tenantId = 'tenant-123';
  const patientId = 'patient-123';

  const mockLabResult = {
    id: 'lab-result-1',
    tenantId,
    patientId,
    encounterId: 'encounter-1',
    labName: 'Hémogramme complet',
    result: {
      hemoglobine: '14.5 g/dL',
      leucocytes: '7500 /mm3',
      plaquettes: '250000 /mm3',
    },
    filePath: null,
    receivedAt: new Date('2023-06-15'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LabResultsService,
        {
          provide: getRepositoryToken(LabResult),
          useValue: mockLabResultRepository,
        },
      ],
    }).compile();

    service = module.get<LabResultsService>(LabResultsService);
    repository = module.get<Repository<LabResult>>(getRepositoryToken(LabResult));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('add', () => {
    it('should create a lab result with tenantId', async () => {
      const createDto: CreateLabResultDto = {
        patientId,
        encounterId: 'encounter-1',
        labName: 'Hémogramme complet',
        result: {
          hemoglobine: '14.5 g/dL',
          leucocytes: '7500 /mm3',
        },
        receivedAt: new Date('2023-06-15'),
      };

      mockLabResultRepository.create.mockReturnValue(mockLabResult);
      mockLabResultRepository.save.mockResolvedValue(mockLabResult);

      const result = await service.add(tenantId, createDto);

      expect(mockLabResultRepository.create).toHaveBeenCalledWith({
        tenantId,
        patientId: createDto.patientId,
        encounterId: createDto.encounterId,
        labName: createDto.labName,
        result: createDto.result,
        filePath: undefined,
        receivedAt: createDto.receivedAt,
      });
      expect(mockLabResultRepository.save).toHaveBeenCalledWith(mockLabResult);
      expect(result).toEqual(mockLabResult);
    });

    it('should set receivedAt to current date when not provided', async () => {
      const createDto: CreateLabResultDto = {
        patientId,
        labName: 'Glycémie',
        result: { glycemie: '0.95 g/L' },
        receivedAt: undefined as any,
      };

      mockLabResultRepository.create.mockReturnValue({ ...mockLabResult, receivedAt: expect.any(Date) });
      mockLabResultRepository.save.mockResolvedValue(mockLabResult);

      await service.add(tenantId, createDto);

      expect(mockLabResultRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          receivedAt: expect.any(Date),
        }),
      );
    });

    it('should include filePath when provided', async () => {
      const createDto: CreateLabResultDto = {
        patientId,
        labName: 'Radio thorax',
        result: { conclusion: 'Normal' },
        filePath: '/uploads/radio-123.pdf',
        receivedAt: new Date(),
      };

      const labResultWithFile = { ...mockLabResult, filePath: '/uploads/radio-123.pdf' };
      mockLabResultRepository.create.mockReturnValue(labResultWithFile);
      mockLabResultRepository.save.mockResolvedValue(labResultWithFile);

      const result = await service.add(tenantId, createDto);

      expect(mockLabResultRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          filePath: '/uploads/radio-123.pdf',
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return only tenant lab results', async () => {
      const labResults = [
        { ...mockLabResult, id: '1' },
        { ...mockLabResult, id: '2', labName: 'Glycémie' },
      ];
      mockLabResultRepository.find.mockResolvedValue(labResults);

      const result = await service.findAll(tenantId);

      expect(mockLabResultRepository.find).toHaveBeenCalledWith({
        where: { tenantId },
        relations: ['patient', 'encounter'],
      });
      expect(result).toEqual(labResults);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no results exist', async () => {
      mockLabResultRepository.find.mockResolvedValue([]);

      const result = await service.findAll(tenantId);

      expect(result).toEqual([]);
    });
  });

  describe('findAllByPatient', () => {
    it('should filter by tenantId and patientId', async () => {
      const labResults = [
        { ...mockLabResult, id: '1' },
        { ...mockLabResult, id: '2', labName: 'Glycémie' },
      ];
      mockLabResultRepository.find.mockResolvedValue(labResults);

      const result = await service.findAllByPatient(tenantId, patientId);

      expect(mockLabResultRepository.find).toHaveBeenCalledWith({
        where: { tenantId, patientId },
        relations: ['encounter'],
        order: { receivedAt: 'DESC' },
      });
      expect(result).toEqual(labResults);
    });

    it('should return results ordered by receivedAt DESC', async () => {
      mockLabResultRepository.find.mockResolvedValue([]);

      await service.findAllByPatient(tenantId, patientId);

      expect(mockLabResultRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { receivedAt: 'DESC' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return lab result by id without tenantId', async () => {
      mockLabResultRepository.findOne.mockResolvedValue(mockLabResult);

      const result = await service.findOne('lab-result-1');

      expect(mockLabResultRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'lab-result-1' },
        relations: ['patient', 'encounter'],
      });
      expect(result).toEqual(mockLabResult);
    });

    it('should filter by tenantId when provided', async () => {
      mockLabResultRepository.findOne.mockResolvedValue(mockLabResult);

      const result = await service.findOne('lab-result-1', tenantId);

      expect(mockLabResultRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'lab-result-1', tenantId },
        relations: ['patient', 'encounter'],
      });
      expect(result).toEqual(mockLabResult);
    });

    it('should throw NotFoundException when lab result not found', async () => {
      mockLabResultRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when lab result not found for tenant', async () => {
      mockLabResultRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('lab-result-1', 'wrong-tenant')).rejects.toThrow(NotFoundException);
    });
  });
});
