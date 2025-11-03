import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ObjectLiteral, Repository } from 'typeorm';

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
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('book', () => {
    it('should create a new appointment successfully', async () => {
      // Arrange
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

      // Mock create and save
      appointmentRepository.create!.mockReturnValue(createdAppointment);
      appointmentRepository.save!.mockResolvedValue(createdAppointment);

      // Act
      const result = await service.book(tenantId, createAppointmentDto);

      // Assert
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

    it('should throw an error if practitioner is not available', async () => {
      // Arrange
      const start = new Date('2023-01-01T10:00:00');
      const end = new Date('2023-01-01T11:00:00');

      const createAppointmentDto = {
        patientId,
        practitionerId,
        startAt: start,
        endAt: end,
      };

      // Mock query builder to return 1 conflicting appointment
      const queryBuilderMock = jest.fn().mockImplementation(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
      }));
      appointmentRepository.createQueryBuilder!.mockImplementation(queryBuilderMock);

      // Act & Assert
      await expect(service.book(tenantId, createAppointmentDto)).rejects.toThrow(
        'Le praticien n\'est pas disponible sur ce créneau',
      );
    });
  });

  describe('cancel', () => {
    it('should cancel an appointment successfully', async () => {
      // Arrange
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

      // Act
      const result = await service.cancel(tenantId, appointmentId);

      // Assert
      expect(appointmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: appointmentId, tenantId },
      });
      expect(appointmentRepository.save).toHaveBeenCalledWith({
        ...appointment,
        status: AppointmentStatus.CANCELLED,
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'appointment.cancelled',
        expect.any(Object),
      );
      expect(result).toEqual(cancelledAppointment);
    });

    it('should throw an error if appointment is not found', async () => {
      // Arrange
      const appointmentId = 'appointment-123';
      appointmentRepository.findOne!.mockResolvedValue(null);

      // Act & Assert
      await expect(service.cancel(tenantId, appointmentId)).rejects.toThrow(
        'Rendez-vous non trouvé',
      );
    });
  });
}); 