import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientsService } from './patients.service';
import { Patient, Gender } from '../entities/patient.entity';
import { ClientProxy } from '@nestjs/microservices';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { UpdatePatientDto } from '../dto/update-patient.dto';

const mockPatient = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  clinicId: '123e4567-e89b-12d3-a456-426614174001',
  mrn: 'MRN123',
  firstName: 'Jean',
  lastName: 'Dupont',
  dob: new Date('1980-01-01'),
  gender: Gender.MALE,
  bloodType: 'A+',
  phone: '0123456789',
  email: 'jean.dupont@example.com',
  address: { street: '123 Rue Test', city: 'Niamey', postalCode: '75000' },
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: undefined,
  medicalHistory: [],
  documents: [],
} as unknown as Patient;

describe('PatientsService', () => {
  let service: PatientsService;
  let repo: Repository<Patient>;
  let clientProxy: ClientProxy;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      softDelete: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        {
          provide: getRepositoryToken(Patient),
          useValue: mockRepository,
        },
        {
          provide: 'RABBITMQ_SERVICE',
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
    repo = module.get<Repository<Patient>>(getRepositoryToken(Patient));
    clientProxy = module.get<ClientProxy>('RABBITMQ_SERVICE');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a patient with clinicId equal to tenantId', async () => {
      const tenantId = '123e4567-e89b-12d3-a456-426614174000';
      const createDto: CreatePatientDto = {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        clinicId: 'should-be-overridden',
        mrn: 'MRN123',
        dob: new Date('1980-01-01'),
        gender: Gender.MALE,
        address: { street: '123 Rue Test', city: 'Niamey', postalCode: '75000' },
      };

      const createdPatient = {
        id: '123e4567-e89b-12d3-a456-426614174111',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        clinicId: tenantId,
        mrn: 'MRN123',
        dob: new Date('1980-01-01'),
        gender: Gender.MALE,
        bloodType: '',
        phone: '',
        address: { street: '123 Rue Test', city: 'Niamey', postalCode: '75000' },
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
        medicalHistory: [],
        documents: [],
      } as unknown as Patient;

      jest.spyOn(repo, 'save').mockResolvedValue(createdPatient);

      const result = await service.create(createDto, tenantId);

      expect(repo.save).toHaveBeenCalled();
      expect(clientProxy.emit).toHaveBeenCalledWith(
        'patient.created',
        expect.objectContaining({
          patient: createdPatient,
          timestamp: expect.any(Date),
        }),
      );
      expect(result).toEqual(createdPatient);
      expect(result.clinicId).toBe(tenantId);
    });

    it('should set default address to Niamey when not provided', async () => {
      const tenantId = 'tenant-id';
      const createDto: CreatePatientDto = {
        firstName: 'Test',
        lastName: 'Patient',
        mrn: 'MRN999',
        dob: new Date('1990-01-01'),
        gender: Gender.FEMALE,
        clinicId: tenantId,
      };

      const savedPatient = {
        ...createDto,
        id: 'new-id',
        clinicId: tenantId,
        address: { city: 'Niamey' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(repo, 'save').mockResolvedValue(savedPatient as any);

      const result = await service.create(createDto, tenantId);

      expect(result.address).toEqual({ city: 'Niamey' });
    });
  });

  describe('findAll', () => {
    it('should return patients for a specific tenant', async () => {
      const tenantId = '123e4567-e89b-12d3-a456-426614174000';
      const expectedPatients = [
        {
          id: '1',
          firstName: 'Jean',
          lastName: 'Dupont',
          clinicId: tenantId,
          mrn: 'MRN123',
          dob: new Date('1980-01-01'),
          gender: Gender.MALE,
          bloodType: '',
          phone: '',
          email: '',
          address: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: undefined,
          medicalHistory: [],
          documents: [],
        },
        {
          id: '2',
          firstName: 'Marie',
          lastName: 'Curie',
          clinicId: tenantId,
          mrn: 'MRN124',
          dob: new Date('1970-01-01'),
          gender: Gender.FEMALE,
          bloodType: '',
          phone: '',
          email: '',
          address: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: undefined,
          medicalHistory: [],
          documents: [],
        },
      ] as unknown as Patient[];

      jest.spyOn(repo, 'find').mockResolvedValue(expectedPatients);

      const result = await service.findAll(tenantId);

      expect(repo.find).toHaveBeenCalledWith({
        where: { clinicId: tenantId },
      });
      expect(result).toEqual(expectedPatients);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no patients exist', async () => {
      jest.spyOn(repo, 'find').mockResolvedValue([]);

      const result = await service.findAll('empty-tenant');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a patient if it exists for the tenant', async () => {
      const tenantId = '123e4567-e89b-12d3-a456-426614174000';
      const expectedPatient = {
        id: '123e4567-e89b-12d3-a456-426614174111',
        firstName: 'Jean',
        lastName: 'Dupont',
        mrn: 'MRN123',
        dob: new Date('1980-01-01'),
        gender: Gender.MALE,
        bloodType: 'A+',
        phone: '0123456789',
        email: 'jean@example.com',
        clinicId: tenantId,
        address: { street: '123 Rue Test', city: 'Niamey' },
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
        medicalHistory: [],
        documents: [],
      } as unknown as Patient;

      jest.spyOn(repo, 'findOne').mockResolvedValue(expectedPatient);

      const result = await service.findOne('123e4567-e89b-12d3-a456-426614174111', tenantId);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174111', clinicId: tenantId },
        relations: ['medicalHistory', 'documents'],
      });
      expect(result).toEqual(expectedPatient);
    });

    it('should throw NotFoundException if patient not found', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);

      await expect(
        service.findOne('123e4567-e89b-12d3-a456-426614174111', '123e4567-e89b-12d3-a456-426614174000'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a patient if it exists for the tenant', async () => {
      const tenantId = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdatePatientDto = {
        firstName: 'Jean-Claude',
        email: 'jc@example.com',
      };

      const existingPatient = {
        id: '123e4567-e89b-12d3-a456-426614174111',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        clinicId: tenantId,
        mrn: 'MRN123',
        dob: new Date('1980-01-01'),
        gender: Gender.MALE,
        bloodType: 'A+',
        phone: '0123456789',
        address: { street: '123 Rue Test', city: 'Niamey' },
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
        medicalHistory: [],
        documents: [],
      } as unknown as Patient;

      const updatedPatient = {
        ...existingPatient,
        firstName: 'Jean-Claude',
        email: 'jc@example.com',
      } as unknown as Patient;

      jest.spyOn(repo, 'findOne').mockResolvedValue(existingPatient);
      jest.spyOn(repo, 'save').mockResolvedValue(updatedPatient);

      const result = await service.update('123e4567-e89b-12d3-a456-426614174111', updateDto, tenantId);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174111', clinicId: tenantId },
        relations: ['medicalHistory', 'documents'],
      });
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...existingPatient,
          ...updateDto,
        }),
      );
      expect(result).toEqual(updatedPatient);
    });

    it('should throw ForbiddenException if attempting to change clinicId', async () => {
      const tenantId = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdatePatientDto = {
        clinicId: 'different-tenant-id',
      };

      const existingPatient = {
        id: '123e4567-e89b-12d3-a456-426614174111',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        clinicId: tenantId,
        mrn: 'MRN123',
        dob: new Date('1980-01-01'),
        gender: Gender.MALE,
        bloodType: 'A+',
        phone: '0123456789',
        address: { street: '123 Rue Test', city: 'Niamey' },
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
        medicalHistory: [],
        documents: [],
      } as unknown as Patient;

      jest.spyOn(repo, 'findOne').mockResolvedValue(existingPatient);

      await expect(
        service.update('123e4567-e89b-12d3-a456-426614174111', updateDto, tenantId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if patient does not exist', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);

      await expect(
        service.update('non-existent', { firstName: 'Test' }, 'tenant-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('archive', () => {
    it('should soft delete a patient if it exists for the tenant', async () => {
      const tenantId = '123e4567-e89b-12d3-a456-426614174000';
      const existingPatient = {
        id: '123e4567-e89b-12d3-a456-426614174111',
        firstName: 'Jean',
        lastName: 'Dupont',
        clinicId: tenantId,
        mrn: 'MRN123',
        dob: new Date('1980-01-01'),
        gender: Gender.MALE,
        bloodType: 'A+',
        phone: '0123456789',
        email: 'jean@example.com',
        address: { street: '123 Rue Test', city: 'Niamey' },
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
        medicalHistory: [],
        documents: [],
      } as unknown as Patient;

      jest.spyOn(repo, 'findOne').mockResolvedValue(existingPatient);
      jest.spyOn(repo, 'softDelete').mockResolvedValue({ affected: 1 } as any);

      await service.archive('123e4567-e89b-12d3-a456-426614174111', tenantId);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174111', clinicId: tenantId },
        relations: ['medicalHistory', 'documents'],
      });
      expect(repo.softDelete).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174111');
    });

    it('should throw NotFoundException if patient does not exist', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);

      await expect(
        service.archive('non-existent', 'tenant-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('search', () => {
    it('should search patients by name within a tenant', async () => {
      const expectedPatients = [
        {
          id: '1',
          firstName: 'Jean',
          lastName: 'Dupont',
          clinicId: '123e4567-e89b-12d3-a456-426614174000',
          mrn: 'MRN123',
          dob: new Date('1980-01-01'),
          gender: Gender.MALE,
          bloodType: 'A+',
          phone: '0123456789',
          email: 'jean@example.com',
          address: { street: '123 Rue Test', city: 'Niamey' },
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: undefined,
          medicalHistory: [],
          documents: [],
        },
      ] as unknown as Patient[];

      const queryBuilderMock = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(expectedPatients),
      };

      jest.spyOn(repo, 'createQueryBuilder').mockReturnValue(queryBuilderMock as any);

      const result = await service.search({
        search: 'jean',
        clinicId: '123e4567-e89b-12d3-a456-426614174000',
      });

      expect(repo.createQueryBuilder).toHaveBeenCalled();
      expect(queryBuilderMock.where).toHaveBeenCalledWith(
        'patient.clinicId = :clinicId',
        { clinicId: '123e4567-e89b-12d3-a456-426614174000' },
      );
      expect(queryBuilderMock.andWhere).toHaveBeenCalled();
      expect(queryBuilderMock.getMany).toHaveBeenCalled();
      expect(result).toEqual(expectedPatients);
    });

    it('should throw ForbiddenException when clinicId is not provided', async () => {
      await expect(
        service.search({ search: 'test' } as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
