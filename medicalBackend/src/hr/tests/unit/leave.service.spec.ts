import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LeaveService } from '../../services/leave.service';
import { StaffService } from '../../services/staff.service';
import { LeaveRequest } from '../../entities/leave-request.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LeaveStatus } from '../../enums/leave-status.enum';

describe('LeaveService', () => {
  let service: LeaveService;
  let leaveRepository: any;
  let staffService: any;
  let eventEmitter: any;

  beforeEach(async () => {
    leaveRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const mockStaffService = {
      findOne: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaveService,
        {
          provide: getRepositoryToken(LeaveRequest),
          useValue: leaveRepository,
        },
        {
          provide: StaffService,
          useValue: mockStaffService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<LeaveService>(LeaveService);
    staffService = module.get<StaffService>(StaffService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('approveLeaveRequest', () => {
    it('should successfully approve a leave request', async () => {
      const mockLeaveRequest = {
        id: '1',
        staffId: '1',
        start: new Date(),
        end: new Date(),
        status: LeaveStatus.PENDING,
        comment: null,
      };

      const approveInput = {
        id: '1',
        status: LeaveStatus.APPROVED,
        comment: 'Approved by unit test',
      };

      leaveRepository.findOne.mockResolvedValue(mockLeaveRequest);
      leaveRepository.save.mockImplementation((leave) => Promise.resolve(leave));

      const result = await service.approveLeaveRequest(approveInput);

      expect(leaveRepository.findOne).toHaveBeenCalled();
      expect(result.status).toBe(LeaveStatus.APPROVED);
      expect(result.comment).toBe('Approved by unit test');
      expect(eventEmitter.emit).toHaveBeenCalled();
    });

    it('should throw BadRequestException when trying to approve a non-pending request', async () => {
      const mockLeaveRequest = {
        id: '1',
        staffId: '1',
        start: new Date(),
        end: new Date(),
        status: LeaveStatus.APPROVED, // Already approved
        comment: null,
      };

      const approveInput = {
        id: '1',
        status: LeaveStatus.REJECTED,
        comment: 'Trying to reject an already approved request',
      };

      leaveRepository.findOne.mockResolvedValue(mockLeaveRequest);

      await expect(service.approveLeaveRequest(approveInput)).rejects.toThrow(BadRequestException);
      expect(leaveRepository.save).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when leave request is not found', async () => {
      leaveRepository.findOne.mockResolvedValue(null);

      const approveInput = {
        id: 'non-existent-id',
        status: LeaveStatus.APPROVED,
      };

      await expect(service.approveLeaveRequest(approveInput)).rejects.toThrow(NotFoundException);
    });
  });
}); 