import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ObjectLiteral, Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { SchedulingService } from '../services/scheduling.service';
import { Appointment } from '../entities/appointment.entity';
import { Practitioner } from '../entities/practitioner.entity';
import { AppointmentStatus } from '../enums/appointment-status.enum';
import { UrgencyLevel } from '../enums/urgency-level.enum';

type MockType<T> = {
  [P in keyof T]?: jest.Mock<any, any>;
};

const createRepositoryMock = <T extends ObjectLiteral = any>(): MockType<Repository<T>> => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  createQueryBuilder: jest.fn().mockImplementation(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(0),
  })),
});

describe('SchedulingService', () => {
  let service: SchedulingService;
  let appointmentRepository: MockType<Repository<Appointment>>;
  let practitionerRepository: MockType<Repository<Practitioner>>;
  let eventEmitter: EventEmitter2;

  const tenantId = 'tenant-123';
  const patientId = 'patient-123';
  const practitionerId = 'practitioner-123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulingService,
        {
          provide: getRepositoryToken(Appointment),
          useValue: createRepositoryMock<Appointment>(),
        },
        {
          provide: getRepositoryToken(Practitioner),
          useValue: createRepositoryMock<Practitioner>(),
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<SchedulingService>(SchedulingService);
    appointmentRepository = module.get(getRepositoryToken(Appointment));
    practitionerRepository = module.get(getRepositoryToken(Practitioner));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('book', () => {
    it('should create a new appointment successfully', async () => {
      const start = new Date('2023-01-01T10:00:00');
      const end = new Date('2023-01-01T11:00:00');

      const createAppointmentDto = {
        patientId,
        practitionerId,
        startAt: start,
        endAt: end,
        room: 'Room 1',
        reason: 'Check-up',
        urgency: UrgencyLevel.ROUTINE,
      };

      const createdAppointment = {
        id: 'appointment-123',
        tenantId,
        ...createAppointmentDto,
        status: AppointmentStatus.BOOKED,
      };

      // Practitioner exists
      practitionerRepository.findOne!.mockResolvedValue({ id: practitionerId });
      // No conflicting appointments
      appointmentRepository.find!.mockResolvedValue([]);
      // Create and save
      appointmentRepository.create!.mockReturnValue(createdAppointment);
      appointmentRepository.save!.mockResolvedValue(createdAppointment);

      const result = await service.book(tenantId, createAppointmentDto);

      expect(practitionerRepository.findOne).toHaveBeenCalledWith({
        where: { id: practitionerId },
      });
      expect(appointmentRepository.create).toHaveBeenCalledWith({
        tenantId,
        ...createAppointmentDto,
        status: AppointmentStatus.BOOKED,
      });
      expect(appointmentRepository.save).toHaveBeenCalledWith(createdAppointment);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'appointment.created',
        expect.any(Object),
      );
      expect(result).toEqual(createdAppointment);
    });

    it('should throw ConflictException when practitioner is not available', async () => {
      const start = new Date('2023-01-01T10:00:00');
      const end = new Date('2023-01-01T11:00:00');

      const createAppointmentDto = {
        patientId,
        practitionerId,
        startAt: start,
        endAt: end,
      };

      // Practitioner exists
      practitionerRepository.findOne!.mockResolvedValue({ id: practitionerId });

      // Conflicting appointment exists (overlaps)
      const conflictingAppointment = {
        id: 'existing-appt',
        practitionerId,
        startAt: new Date('2023-01-01T09:30:00'),
        endAt: new Date('2023-01-01T10:30:00'),
        patientId: 'other-patient',
        status: AppointmentStatus.BOOKED,
      };
      appointmentRepository.find!.mockResolvedValue([conflictingAppointment]);

      await expect(service.book(tenantId, createAppointmentDto)).rejects.toThrow(ConflictException);
    });

    it('should throw HttpException when practitioner does not exist', async () => {
      const createAppointmentDto = {
        patientId,
        practitionerId: 'non-existent',
        startAt: new Date('2023-01-01T10:00:00'),
        endAt: new Date('2023-01-01T11:00:00'),
      };

      practitionerRepository.findOne!.mockResolvedValue(null);

      await expect(service.book(tenantId, createAppointmentDto)).rejects.toThrow();
    });
  });

  describe('reschedule', () => {
    it('should reschedule an appointment successfully', async () => {
      const existingAppointment = {
        id: 'appointment-123',
        tenantId,
        patientId,
        practitionerId,
        startAt: new Date('2023-01-01T10:00:00'),
        endAt: new Date('2023-01-01T11:00:00'),
        status: AppointmentStatus.BOOKED,
      };

      const rescheduleDto = {
        appointmentId: 'appointment-123',
        startAt: new Date('2023-01-02T14:00:00'),
        endAt: new Date('2023-01-02T15:00:00'),
      };

      const rescheduledAppointment = {
        ...existingAppointment,
        startAt: rescheduleDto.startAt,
        endAt: rescheduleDto.endAt,
      };

      appointmentRepository.findOne!.mockResolvedValue(existingAppointment);
      // No conflicts (excluding self)
      appointmentRepository.find!.mockResolvedValue([]);
      appointmentRepository.save!.mockResolvedValue(rescheduledAppointment);

      const result = await service.reschedule(tenantId, rescheduleDto);

      expect(appointmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'appointment-123', tenantId },
      });
      expect(appointmentRepository.save).toHaveBeenCalled();
      expect(result.startAt).toEqual(rescheduleDto.startAt);
      expect(result.endAt).toEqual(rescheduleDto.endAt);
    });

    it('should throw ConflictException when rescheduling conflicts with another appointment', async () => {
      const existingAppointment = {
        id: 'appointment-123',
        tenantId,
        patientId,
        practitionerId,
        startAt: new Date('2023-01-01T10:00:00'),
        endAt: new Date('2023-01-01T11:00:00'),
        status: AppointmentStatus.BOOKED,
      };

      const rescheduleDto = {
        appointmentId: 'appointment-123',
        startAt: new Date('2023-01-02T14:00:00'),
        endAt: new Date('2023-01-02T15:00:00'),
      };

      appointmentRepository.findOne!.mockResolvedValue(existingAppointment);
      // Another appointment conflicts with the new slot
      appointmentRepository.find!.mockResolvedValue([
        {
          id: 'other-appt',
          practitionerId,
          startAt: new Date('2023-01-02T14:30:00'),
          endAt: new Date('2023-01-02T15:30:00'),
          patientId: 'other-patient',
          status: AppointmentStatus.BOOKED,
        },
      ]);

      await expect(service.reschedule(tenantId, rescheduleDto)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when appointment is not found', async () => {
      appointmentRepository.findOne!.mockResolvedValue(null);

      await expect(
        service.reschedule(tenantId, {
          appointmentId: 'non-existent',
          startAt: new Date(),
          endAt: new Date(),
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancel', () => {
    it('should cancel an appointment successfully', async () => {
      const appointmentId = 'appointment-123';
      const appointment = {
        id: appointmentId,
        tenantId,
        patientId,
        practitionerId,
        status: AppointmentStatus.BOOKED,
        startAt: new Date('2023-01-01T10:00:00'),
        endAt: new Date('2023-01-01T11:00:00'),
      };

      const cancelledAppointment = {
        ...appointment,
        status: AppointmentStatus.CANCELLED,
      };

      appointmentRepository.findOne!.mockResolvedValue(appointment);
      appointmentRepository.save!.mockResolvedValue(cancelledAppointment);

      const result = await service.cancel(tenantId, appointmentId);

      expect(appointmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: appointmentId, tenantId },
      });
      expect(appointmentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: AppointmentStatus.CANCELLED,
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'appointment.cancelled',
        expect.any(Object),
      );
      expect(result).toEqual(cancelledAppointment);
    });

    it('should throw NotFoundException when appointment is not found', async () => {
      appointmentRepository.findOne!.mockResolvedValue(null);

      await expect(service.cancel(tenantId, 'non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should include cancellation reason when provided', async () => {
      const appointment = {
        id: 'appointment-123',
        tenantId,
        patientId,
        practitionerId,
        status: AppointmentStatus.BOOKED,
        reason: 'Check-up',
      };

      appointmentRepository.findOne!.mockResolvedValue(appointment);
      appointmentRepository.save!.mockResolvedValue({
        ...appointment,
        status: AppointmentStatus.CANCELLED,
        reason: 'Annulé: Patient request',
      });

      await service.cancel(tenantId, 'appointment-123', {
        cancellationReason: 'Patient request',
      });

      expect(appointmentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: AppointmentStatus.CANCELLED,
          reason: 'Annulé: Patient request',
        }),
      );
    });
  });

  describe('getAllAppointments', () => {
    it('should return all appointments for a tenant', async () => {
      const appointments = [
        { id: '1', tenantId, status: AppointmentStatus.BOOKED },
        { id: '2', tenantId, status: AppointmentStatus.DONE },
      ];
      appointmentRepository.find!.mockResolvedValue(appointments);

      const result = await service.getAllAppointments(tenantId);

      expect(appointmentRepository.find).toHaveBeenCalledWith({
        where: { tenantId },
        order: { startAt: 'ASC' },
        relations: ['practitioner'],
      });
      expect(result).toEqual(appointments);
      expect(result).toHaveLength(2);
    });

    it('should filter by date when provided', async () => {
      const appointments = [{ id: '1', tenantId }];
      appointmentRepository.find!.mockResolvedValue(appointments);

      const result = await service.getAllAppointments(tenantId, '2023-01-01');

      expect(appointmentRepository.find).toHaveBeenCalledWith({
        where: expect.objectContaining({
          tenantId,
          startAt: expect.any(Object),
          endAt: expect.any(Object),
        }),
        order: { startAt: 'ASC' },
        relations: ['practitioner'],
      });
      expect(result).toEqual(appointments);
    });
  });

  describe('getAppointmentById', () => {
    it('should return appointment by id and tenantId', async () => {
      const appointment = {
        id: 'appointment-123',
        tenantId,
        patientId,
        practitionerId,
        status: AppointmentStatus.BOOKED,
      };
      appointmentRepository.findOne!.mockResolvedValue(appointment);

      const result = await service.getAppointmentById(tenantId, 'appointment-123');

      expect(appointmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'appointment-123', tenantId },
        relations: ['practitioner'],
      });
      expect(result).toEqual(appointment);
    });

    it('should throw NotFoundException when appointment not found', async () => {
      appointmentRepository.findOne!.mockResolvedValue(null);

      await expect(
        service.getAppointmentById(tenantId, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
