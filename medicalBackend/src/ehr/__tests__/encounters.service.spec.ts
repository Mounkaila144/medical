import { Test, TestingModule } from '@nestjs/testing';
import { EncountersService } from '../services/encounters.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Encounter } from '../entities/encounter.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { CreateEncounterDto } from '../dto/create-encounter.dto';
import { UpdateEncounterDto } from '../dto/update-encounter.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('EncountersService', () => {
  let service: EncountersService;
  let repository: Repository<Encounter>;
  let eventEmitter: EventEmitter2;

  const mockEncounter = {
    id: 'test-id',
    tenantId: 'tenant-id',
    patientId: 'patient-id',
    practitionerId: 'practitioner-id',
    startAt: new Date(),
    motive: 'Test motive',
    locked: false,
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncountersService,
        {
          provide: getRepositoryToken(Encounter),
          useValue: mockRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<EncountersService>(EncountersService);
    repository = module.get<Repository<Encounter>>(getRepositoryToken(Encounter));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new encounter with tenantId', async () => {
      const createEncounterDto: CreateEncounterDto = {
        patientId: 'patient-id',
        practitionerId: 'practitioner-id',
        startAt: new Date(),
        motive: 'Test motive',
      };

      mockRepository.create.mockReturnValue(mockEncounter);
      mockRepository.save.mockResolvedValue(mockEncounter);

      const result = await service.create('tenant-id', createEncounterDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        tenantId: 'tenant-id',
        patientId: createEncounterDto.patientId,
        practitionerId: createEncounterDto.practitionerId,
        startAt: createEncounterDto.startAt,
        endAt: undefined,
        motive: createEncounterDto.motive,
        exam: undefined,
        diagnosis: undefined,
        icd10Codes: [],
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockEncounter);
      expect(result).toEqual(mockEncounter);
    });

    it('should create encounter with icd10Codes', async () => {
      const createEncounterDto: CreateEncounterDto = {
        patientId: 'patient-id',
        practitionerId: 'practitioner-id',
        startAt: new Date(),
        motive: 'Test motive',
        icd10Codes: ['A01', 'B02'],
      };

      const encounterWithCodes = { ...mockEncounter, icd10Codes: ['A01', 'B02'] };
      mockRepository.create.mockReturnValue(encounterWithCodes);
      mockRepository.save.mockResolvedValue(encounterWithCodes);

      const result = await service.create('tenant-id', createEncounterDto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          icd10Codes: ['A01', 'B02'],
        }),
      );
      expect(result.icd10Codes).toEqual(['A01', 'B02']);
    });
  });

  describe('findAll', () => {
    it('should return encounters for a specific tenant', async () => {
      mockRepository.find.mockResolvedValue([mockEncounter]);

      const result = await service.findAll('tenant-id');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-id' },
        relations: ['patient', 'practitioner', 'prescriptions', 'labResults'],
      });
      expect(result).toEqual([mockEncounter]);
    });

    it('should return empty array when no encounters exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll('tenant-id');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return an encounter by id without tenantId', async () => {
      mockRepository.findOne.mockResolvedValue(mockEncounter);

      const result = await service.findOne('test-id');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['patient', 'practitioner', 'prescriptions', 'labResults'],
      });
      expect(result).toEqual(mockEncounter);
    });

    it('should filter by tenantId when provided', async () => {
      mockRepository.findOne.mockResolvedValue(mockEncounter);

      const result = await service.findOne('test-id', 'tenant-id');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id', tenantId: 'tenant-id' },
        relations: ['patient', 'practitioner', 'prescriptions', 'labResults'],
      });
      expect(result).toEqual(mockEncounter);
    });

    it('should throw NotFoundException if encounter not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if encounter not found for tenant', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('test-id', 'wrong-tenant')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an encounter', async () => {
      const updateEncounterDto: UpdateEncounterDto = {
        id: 'test-id',
        motive: 'Updated motive',
      };

      mockRepository.findOne.mockResolvedValue(mockEncounter);
      mockRepository.save.mockResolvedValue({ ...mockEncounter, ...updateEncounterDto });

      const result = await service.update('tenant-id', updateEncounterDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id', tenantId: 'tenant-id' },
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.motive).toEqual('Updated motive');
    });

    it('should throw NotFoundException if encounter not found', async () => {
      const updateEncounterDto: UpdateEncounterDto = {
        id: 'non-existent-id',
        motive: 'Updated motive',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('tenant-id', updateEncounterDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if encounter is locked', async () => {
      const updateEncounterDto: UpdateEncounterDto = {
        id: 'test-id',
        motive: 'Updated motive',
      };

      mockRepository.findOne.mockResolvedValue({ ...mockEncounter, locked: true });

      await expect(service.update('tenant-id', updateEncounterDto)).rejects.toThrow(ForbiddenException);
    });

    it('should update multiple fields at once', async () => {
      const updateEncounterDto: UpdateEncounterDto = {
        id: 'test-id',
        motive: 'Updated motive',
        exam: 'Physical exam',
        diagnosis: 'Common cold',
      };

      mockRepository.findOne.mockResolvedValue({ ...mockEncounter });
      mockRepository.save.mockResolvedValue({ ...mockEncounter, ...updateEncounterDto });

      const result = await service.update('tenant-id', updateEncounterDto);

      expect(result.motive).toEqual('Updated motive');
      expect(result.exam).toEqual('Physical exam');
      expect(result.diagnosis).toEqual('Common cold');
    });
  });

  describe('lock', () => {
    it('should lock an encounter and emit event', async () => {
      mockRepository.findOne.mockResolvedValue(mockEncounter);
      mockRepository.save.mockResolvedValue({ ...mockEncounter, locked: true });

      const result = await service.lock('tenant-id', { id: 'test-id' });

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id', tenantId: 'tenant-id' },
        relations: ['patient', 'practitioner'],
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'encounter.locked',
        expect.any(Object),
      );
      expect(result.locked).toBe(true);
    });

    it('should throw NotFoundException if encounter not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.lock('tenant-id', { id: 'non-existent-id' })).rejects.toThrow(NotFoundException);
    });

    it('should set locked=true on the encounter entity', async () => {
      const unlocked = { ...mockEncounter, locked: false };
      mockRepository.findOne.mockResolvedValue(unlocked);
      mockRepository.save.mockImplementation((enc) => Promise.resolve(enc));

      const result = await service.lock('tenant-id', { id: 'test-id' });

      expect(result.locked).toBe(true);
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ locked: true }),
      );
    });
  });
});
