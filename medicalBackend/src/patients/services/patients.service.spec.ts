import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientsService } from './patients.service';
import { Patient, Gender } from '../entities/patient.entity';
import { ClientProxy } from '@nestjs/microservices';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { UpdatePatientDto } from '../dto/update-patient.dto';

const mockPatient: Patient = {
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
  address: { street: '123 Rue Test', city: 'Paris', postalCode: '75000' },
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: undefined,
  medicalHistory: [],
  documents: [],
};

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
    it('should create a patient with the correct tenantId', async () => {
      const createDto: CreatePatientDto = { 
        firstName: 'Jean', 
        lastName: 'Dupont', 
        email: 'jean@example.com',
        clinicId: '123e4567-e89b-12d3-a456-426614174000',
        mrn: 'MRN123',
        dob: new Date('1980-01-01'),
        gender: Gender.MALE,
        address: { street: '123 Rue Test', city: 'Paris', postalCode: '75000' }
      };
      
      const createdPatient: Patient = { 
        id: '123e4567-e89b-12d3-a456-426614174111',
        firstName: 'Jean', 
        lastName: 'Dupont', 
        email: 'jean@example.com',
        clinicId: '123e4567-e89b-12d3-a456-426614174000',
        mrn: 'MRN123',
        dob: new Date('1980-01-01'),
        gender: Gender.MALE,
        bloodType: '',
        phone: '',
        address: { street: '123 Rue Test', city: 'Paris', postalCode: '75000' },
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
        medicalHistory: [],
        documents: [],
      };
      
      jest.spyOn(repo, 'create').mockReturnValue(createdPatient);
      jest.spyOn(repo, 'save').mockResolvedValue(createdPatient);
      
      const result = await service.create(createDto, '123e4567-e89b-12d3-a456-426614174000');
      
      expect(repo.create).toHaveBeenCalledWith({
        ...createDto,
        clinicId: '123e4567-e89b-12d3-a456-426614174000'
      });
      expect(repo.save).toHaveBeenCalled();
      expect(clientProxy.emit).toHaveBeenCalledWith(
        'patient.created',
        expect.objectContaining({
          patient: createdPatient,
          timestamp: expect.any(Date),
        })
      );
      expect(result).toEqual(createdPatient);
    });
  });

  describe('findAll', () => {
    it('should return patients for a specific tenant', async () => {
      const expectedPatients: Patient[] = [
        { 
          id: '1',
          firstName: 'Jean',
          lastName: 'Dupont',
          clinicId: '123e4567-e89b-12d3-a456-426614174000',
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
          clinicId: '123e4567-e89b-12d3-a456-426614174000',
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
      ];
      
      jest.spyOn(repo, 'find').mockResolvedValue(expectedPatients);
      
      const result = await service.findAll('123e4567-e89b-12d3-a456-426614174000');
      
      expect(repo.find).toHaveBeenCalledWith({
        where: { clinicId: '123e4567-e89b-12d3-a456-426614174000' },
      });
      expect(result).toEqual(expectedPatients);
    });
  });

  describe('findOne', () => {
    it('should return a patient if it exists for the tenant', async () => {
      const expectedPatient: Patient = { 
        id: '123e4567-e89b-12d3-a456-426614174111', 
        firstName: 'Jean', 
        lastName: 'Dupont',
        mrn: 'MRN123',
        dob: new Date('1980-01-01'),
        gender: Gender.MALE,
        bloodType: 'A+',
        phone: '0123456789',
        email: 'jean@example.com',
        clinicId: '123e4567-e89b-12d3-a456-426614174000',
        address: { street: '123 Rue Test', city: 'Paris' },
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
        medicalHistory: [],
        documents: []
      };
      
      jest.spyOn(repo, 'findOne').mockResolvedValue(expectedPatient);
      
      const result = await service.findOne('123e4567-e89b-12d3-a456-426614174111', '123e4567-e89b-12d3-a456-426614174000');
      
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174111', clinicId: '123e4567-e89b-12d3-a456-426614174000' },
        relations: ['medicalHistory', 'documents'],
      });
      expect(result).toEqual(expectedPatient);
    });

    it('should throw NotFoundException if patient not found', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);
      
      await expect(service.findOne('123e4567-e89b-12d3-a456-426614174111', '123e4567-e89b-12d3-a456-426614174000')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a patient if it exists for the tenant', async () => {
      const updateDto: UpdatePatientDto = { 
        firstName: 'Jean-Claude', 
        email: 'jc@example.com'
      };
      
      const existingPatient: Patient = { 
        id: '123e4567-e89b-12d3-a456-426614174111', 
        firstName: 'Jean', 
        lastName: 'Dupont', 
        email: 'jean@example.com',
        clinicId: '123e4567-e89b-12d3-a456-426614174000',
        mrn: 'MRN123',
        dob: new Date('1980-01-01'),
        gender: Gender.MALE,
        bloodType: 'A+',
        phone: '0123456789',
        address: { street: '123 Rue Test', city: 'Paris' },
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
        medicalHistory: [],
        documents: []
      };
      
      const updatedPatient: Patient = { 
        ...existingPatient, 
        firstName: 'Jean-Claude',
        email: 'jc@example.com'
      };
      
      jest.spyOn(repo, 'findOne').mockResolvedValue(existingPatient);
      jest.spyOn(repo, 'save').mockResolvedValue(updatedPatient);
      
      const result = await service.update('123e4567-e89b-12d3-a456-426614174111', updateDto, '123e4567-e89b-12d3-a456-426614174000');
      
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174111', clinicId: '123e4567-e89b-12d3-a456-426614174000' },
        relations: ['medicalHistory', 'documents'],
      });
      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({
        ...existingPatient,
        ...updateDto
      }));
      expect(result).toEqual(updatedPatient);
    });

    it('should throw ForbiddenException if attempting to change clinicId', async () => {
      const updateDto: UpdatePatientDto = { 
        clinicId: 'different-tenant-id'
      };
      
      const existingPatient: Patient = { 
        id: '123e4567-e89b-12d3-a456-426614174111', 
        firstName: 'Jean', 
        lastName: 'Dupont', 
        email: 'jean@example.com',
        clinicId: '123e4567-e89b-12d3-a456-426614174000',
        mrn: 'MRN123',
        dob: new Date('1980-01-01'),
        gender: Gender.MALE,
        bloodType: 'A+',
        phone: '0123456789',
        address: { street: '123 Rue Test', city: 'Paris' },
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
        medicalHistory: [],
        documents: []
      };
      
      jest.spyOn(repo, 'findOne').mockResolvedValue(existingPatient);
      
      await expect(service.update('123e4567-e89b-12d3-a456-426614174111', updateDto, '123e4567-e89b-12d3-a456-426614174000')).rejects.toThrow(ForbiddenException);
    });
  });
  
  describe('archive', () => {
    it('should soft delete a patient if it exists for the tenant', async () => {
      const existingPatient: Patient = { 
        id: '123e4567-e89b-12d3-a456-426614174111', 
        firstName: 'Jean', 
        lastName: 'Dupont', 
        clinicId: '123e4567-e89b-12d3-a456-426614174000',
        mrn: 'MRN123',
        dob: new Date('1980-01-01'),
        gender: Gender.MALE,
        bloodType: 'A+',
        phone: '0123456789',
        email: 'jean@example.com',
        address: { street: '123 Rue Test', city: 'Paris' },
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
        medicalHistory: [],
        documents: []
      };
      
      jest.spyOn(repo, 'findOne').mockResolvedValue(existingPatient);
      jest.spyOn(repo, 'softDelete').mockResolvedValue({ affected: 1 } as any);
      
      await service.archive('123e4567-e89b-12d3-a456-426614174111', '123e4567-e89b-12d3-a456-426614174000');
      
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174111', clinicId: '123e4567-e89b-12d3-a456-426614174000' },
        relations: ['medicalHistory', 'documents'],
      });
      expect(repo.softDelete).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174111');
    });
  });
  
  describe('search', () => {
    it('should search patients by name within a tenant', async () => {
      const expectedPatients: Patient[] = [
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
          address: { street: '123 Rue Test', city: 'Paris' },
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: undefined,
          medicalHistory: [],
          documents: []
        },
        {
          id: '2',
          firstName: 'Jean',
          lastName: 'Martin',
          clinicId: '123e4567-e89b-12d3-a456-426614174000',
          mrn: 'MRN124',
          dob: new Date('1975-05-15'),
          gender: Gender.MALE,
          bloodType: 'B+',
          phone: '0123456788',
          email: 'jm@example.com',
          address: { street: '456 Rue Test', city: 'Lyon' },
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: undefined,
          medicalHistory: [],
          documents: []
        },
      ];
      
      const queryBuilderMock = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(expectedPatients),
      };
      
      jest.spyOn(repo, 'createQueryBuilder').mockReturnValue(queryBuilderMock as any);
      
      const result = await service.search({ 
        search: 'jean', 
        clinicId: '123e4567-e89b-12d3-a456-426614174000' 
      });
      
      expect(repo.createQueryBuilder).toHaveBeenCalled();
      expect(queryBuilderMock.where).toHaveBeenCalledWith('patient.clinicId = :clinicId', 
        { clinicId: '123e4567-e89b-12d3-a456-426614174000' });
      expect(queryBuilderMock.andWhere).toHaveBeenCalled();
      expect(queryBuilderMock.getMany).toHaveBeenCalled();
      expect(result).toEqual(expectedPatients);
    });
  });
}); 