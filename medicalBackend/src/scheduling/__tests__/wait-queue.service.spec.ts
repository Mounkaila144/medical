import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { WaitQueueService } from '../services/wait-queue.service';
import { WaitQueueEntry, QueueStatus, Priority } from '../entities/wait-queue-entry.entity';

describe('WaitQueueService', () => {
  let service: WaitQueueService;

  const mockWaitQueueRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const tenantId = 'tenant-123';
  const patientId = 'patient-123';
  const practitionerId = 'practitioner-123';

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaitQueueService,
        {
          provide: getRepositoryToken(WaitQueueEntry),
          useValue: mockWaitQueueRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<WaitQueueService>(WaitQueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('enqueue', () => {
    it('should create entry with ticket number and rank', async () => {
      const createDto = {
        patientId,
        practitionerId,
        priority: Priority.NORMAL,
        reason: 'Consultation',
      };

      // No existing entry for this patient
      mockWaitQueueRepository.findOne
        .mockResolvedValueOnce(null) // No existing patient in queue
        .mockResolvedValueOnce(null); // No last entry (queue empty)

      // Ticket number generation: count returns 0
      mockWaitQueueRepository.count.mockResolvedValue(0);

      const createdEntry = {
        id: 'entry-1',
        tenantId,
        ...createDto,
        rank: 1,
        ticketNumber: 'A001',
        status: QueueStatus.WAITING,
      };

      mockWaitQueueRepository.create.mockReturnValue(createdEntry);
      mockWaitQueueRepository.save.mockResolvedValue(createdEntry);

      // For emitQueueUpdatedEvent -> getQueue
      mockWaitQueueRepository.find.mockResolvedValue([createdEntry]);

      const result = await service.enqueue(tenantId, createDto);

      expect(mockWaitQueueRepository.create).toHaveBeenCalledWith({
        tenantId,
        patientId,
        practitionerId,
        priority: Priority.NORMAL,
        reason: 'Consultation',
        rank: 1,
        ticketNumber: 'A001',
        status: QueueStatus.WAITING,
      });
      expect(mockWaitQueueRepository.save).toHaveBeenCalledWith(createdEntry);
      expect(result).toEqual(createdEntry);
    });

    it('should assign correct rank when queue is not empty', async () => {
      const createDto = {
        patientId: 'patient-456',
        priority: Priority.NORMAL,
      };

      // No existing entry for this patient
      mockWaitQueueRepository.findOne
        .mockResolvedValueOnce(null) // No existing patient in queue
        .mockResolvedValueOnce({ rank: 5 }); // Last entry has rank 5

      mockWaitQueueRepository.count.mockResolvedValue(5);

      const createdEntry = {
        id: 'entry-6',
        tenantId,
        patientId: 'patient-456',
        rank: 6,
        ticketNumber: 'A006',
        status: QueueStatus.WAITING,
      };

      mockWaitQueueRepository.create.mockReturnValue(createdEntry);
      mockWaitQueueRepository.save.mockResolvedValue(createdEntry);
      mockWaitQueueRepository.find.mockResolvedValue([createdEntry]);

      const result = await service.enqueue(tenantId, createDto);

      expect(mockWaitQueueRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ rank: 6 }),
      );
      expect(result.rank).toBe(6);
    });

    it('should throw ConflictException when patient is already in queue', async () => {
      const createDto = {
        patientId,
        priority: Priority.NORMAL,
      };

      // Patient already in queue with WAITING status
      mockWaitQueueRepository.findOne.mockResolvedValueOnce({
        id: 'existing-entry',
        patientId,
        status: QueueStatus.WAITING,
      });

      await expect(service.enqueue(tenantId, createDto)).rejects.toThrow(ConflictException);
    });

    it('should allow enqueue without patientId', async () => {
      const createDto = {
        priority: Priority.LOW,
        reason: 'Walk-in',
      };

      mockWaitQueueRepository.findOne.mockResolvedValueOnce(null); // No last entry
      mockWaitQueueRepository.count.mockResolvedValue(0);

      const createdEntry = {
        id: 'entry-1',
        tenantId,
        rank: 1,
        ticketNumber: 'A001',
        status: QueueStatus.WAITING,
      };

      mockWaitQueueRepository.create.mockReturnValue(createdEntry);
      mockWaitQueueRepository.save.mockResolvedValue(createdEntry);
      mockWaitQueueRepository.find.mockResolvedValue([createdEntry]);

      const result = await service.enqueue(tenantId, createDto);

      // Should not check for existing patient since patientId is not provided
      expect(result).toEqual(createdEntry);
    });
  });

  describe('callNext', () => {
    it('should get next WAITING entry and update to CALLED', async () => {
      // No currently called/serving
      mockWaitQueueRepository.findOne
        .mockResolvedValueOnce(null) // No current entry
        .mockResolvedValueOnce({     // Next waiting entry
          id: 'entry-1',
          tenantId,
          patientId,
          rank: 1,
          status: QueueStatus.WAITING,
        });

      const calledEntry = {
        id: 'entry-1',
        tenantId,
        patientId,
        rank: 1,
        status: QueueStatus.CALLED,
        calledAt: expect.any(Date),
      };

      mockWaitQueueRepository.save.mockResolvedValue(calledEntry);
      mockWaitQueueRepository.find.mockResolvedValue([]);

      const result = await service.callNext(tenantId);

      expect(result).toBeDefined();
      expect(mockWaitQueueRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: QueueStatus.CALLED,
          calledAt: expect.any(Date),
        }),
      );
    });

    it('should complete current entry before calling next', async () => {
      const currentEntry = {
        id: 'entry-current',
        tenantId,
        status: QueueStatus.CALLED,
      };

      const nextEntry = {
        id: 'entry-next',
        tenantId,
        patientId: 'patient-456',
        rank: 2,
        status: QueueStatus.WAITING,
      };

      mockWaitQueueRepository.findOne
        .mockResolvedValueOnce(currentEntry)  // Current serving
        .mockResolvedValueOnce(nextEntry);     // Next waiting

      mockWaitQueueRepository.save.mockResolvedValue(nextEntry);
      mockWaitQueueRepository.find.mockResolvedValue([]);

      await service.callNext(tenantId);

      // First save: complete current entry
      expect(mockWaitQueueRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'entry-current',
          status: QueueStatus.COMPLETED,
          servedAt: expect.any(Date),
        }),
      );
    });

    it('should return null when no waiting entries', async () => {
      mockWaitQueueRepository.findOne
        .mockResolvedValueOnce(null)  // No current
        .mockResolvedValueOnce(null); // No waiting

      mockWaitQueueRepository.find.mockResolvedValue([]);

      const result = await service.callNext(tenantId);

      expect(result).toBeNull();
    });
  });

  describe('markAsServing', () => {
    it('should update status to SERVING', async () => {
      const calledEntry = {
        id: 'entry-1',
        tenantId,
        status: QueueStatus.CALLED,
      };

      const servingEntry = {
        ...calledEntry,
        status: QueueStatus.SERVING,
      };

      mockWaitQueueRepository.findOne.mockResolvedValue(calledEntry);
      mockWaitQueueRepository.save.mockResolvedValue(servingEntry);
      mockWaitQueueRepository.find.mockResolvedValue([]);

      const result = await service.markAsServing(tenantId, 'entry-1');

      expect(mockWaitQueueRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'entry-1', tenantId, status: QueueStatus.CALLED },
      });
      expect(mockWaitQueueRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: QueueStatus.SERVING }),
      );
      expect(result.status).toBe(QueueStatus.SERVING);
    });

    it('should throw NotFoundException when entry not found', async () => {
      mockWaitQueueRepository.findOne.mockResolvedValue(null);

      await expect(service.markAsServing(tenantId, 'non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('complete', () => {
    it('should update status to COMPLETED', async () => {
      const entry = {
        id: 'entry-1',
        tenantId,
        status: QueueStatus.SERVING,
      };

      mockWaitQueueRepository.findOne.mockResolvedValue(entry);
      mockWaitQueueRepository.save.mockResolvedValue({
        ...entry,
        status: QueueStatus.COMPLETED,
        servedAt: new Date(),
      });
      mockWaitQueueRepository.find.mockResolvedValue([]);

      await service.complete(tenantId, 'entry-1');

      expect(mockWaitQueueRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: QueueStatus.COMPLETED,
          servedAt: expect.any(Date),
        }),
      );
    });

    it('should throw NotFoundException when entry not found', async () => {
      mockWaitQueueRepository.findOne.mockResolvedValue(null);

      await expect(service.complete(tenantId, 'non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getQueue', () => {
    it('should return entries ordered by rank', async () => {
      const entries = [
        { id: '1', tenantId, rank: 1, status: QueueStatus.WAITING },
        { id: '2', tenantId, rank: 2, status: QueueStatus.WAITING },
        { id: '3', tenantId, rank: 3, status: QueueStatus.CALLED },
      ];

      mockWaitQueueRepository.find.mockResolvedValue(entries);

      const result = await service.getQueue(tenantId);

      expect(mockWaitQueueRepository.find).toHaveBeenCalledWith({
        where: [
          { tenantId, status: QueueStatus.WAITING },
          { tenantId, status: QueueStatus.CALLED },
          { tenantId, status: QueueStatus.SERVING },
        ],
        order: { rank: 'ASC' },
      });
      expect(result).toEqual(entries);
      expect(result).toHaveLength(3);
    });

    it('should return empty array when queue is empty', async () => {
      mockWaitQueueRepository.find.mockResolvedValue([]);

      const result = await service.getQueue(tenantId);

      expect(result).toEqual([]);
    });
  });

  describe('getCurrentlyServing', () => {
    it('should return currently serving entry', async () => {
      const serving = {
        id: 'entry-1',
        tenantId,
        status: QueueStatus.SERVING,
        calledAt: new Date(),
      };

      mockWaitQueueRepository.findOne.mockResolvedValue(serving);

      const result = await service.getCurrentlyServing(tenantId);

      expect(result).toEqual(serving);
    });

    it('should return null when no one is being served', async () => {
      mockWaitQueueRepository.findOne.mockResolvedValue(null);

      const result = await service.getCurrentlyServing(tenantId);

      expect(result).toBeNull();
    });
  });
});
