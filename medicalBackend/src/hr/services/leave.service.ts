import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { LeaveRequest } from '../entities/leave-request.entity';
import { CreateLeaveRequestInput, UpdateLeaveRequestInput, ApproveLeaveRequestInput } from '../dtos/leave-request.dto';
import { StaffService } from './staff.service';
import { LeaveStatus } from '../enums/leave-status.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(LeaveRequest)
    private leaveRequestRepository: Repository<LeaveRequest>,
    private staffService: StaffService,
    private eventEmitter: EventEmitter2,
  ) {}

  async findAll(): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.find({ 
      relations: ['staff'],
      order: { createdAt: 'DESC' }
    });
  }

  async findByStaff(staffId: string): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.find({ 
      where: { staffId },
      relations: ['staff'],
      order: { start: 'ASC' }
    });
  }

  async findPendingRequests(): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.find({
      where: { status: LeaveStatus.PENDING },
      relations: ['staff'],
      order: { createdAt: 'ASC' }
    });
  }

  async findOne(id: string): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.findOne({ 
      where: { id },
      relations: ['staff']
    });
    if (!leaveRequest) {
      throw new NotFoundException(`Leave request with ID ${id} not found`);
    }
    return leaveRequest;
  }

  async create(createLeaveRequestInput: CreateLeaveRequestInput): Promise<LeaveRequest> {
    // Verify staff exists
    await this.staffService.findOne(createLeaveRequestInput.staffId);
    
    // Validate dates
    if (createLeaveRequestInput.start > createLeaveRequestInput.end) {
      throw new BadRequestException('Start date must be before end date');
    }
    
    const leaveRequest = this.leaveRequestRepository.create({
      ...createLeaveRequestInput,
      status: LeaveStatus.PENDING
    });
    const savedRequest = await this.leaveRequestRepository.save(leaveRequest);
    
    this.eventEmitter.emit('leave.requested', savedRequest);
    
    return savedRequest;
  }

  async update(id: string, updateLeaveRequestInput: UpdateLeaveRequestInput): Promise<LeaveRequest> {
    const leaveRequest = await this.findOne(id);
    
    // Prevent updates to approved/rejected requests
    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(`Cannot update leave request with status ${leaveRequest.status}`);
    }
    
    Object.assign(leaveRequest, updateLeaveRequestInput);
    return this.leaveRequestRepository.save(leaveRequest);
  }

  async approveLeaveRequest(approveInput: ApproveLeaveRequestInput): Promise<LeaveRequest> {
    const leaveRequest = await this.findOne(approveInput.id);
    
    // Only pending requests can be approved/rejected
    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(`Cannot approve/reject leave request with status ${leaveRequest.status}`);
    }
    
    leaveRequest.status = approveInput.status;
    if (approveInput.comment) {
      leaveRequest.comment = approveInput.comment;
    }
    
    const savedRequest = await this.leaveRequestRepository.save(leaveRequest);
    
    // Emit appropriate event
    if (approveInput.status === LeaveStatus.APPROVED) {
      this.eventEmitter.emit('leave.approved', savedRequest);
    } else if (approveInput.status === LeaveStatus.REJECTED) {
      this.eventEmitter.emit('leave.rejected', savedRequest);
    }
    
    return savedRequest;
  }

  async remove(id: string): Promise<boolean> {
    const leaveRequest = await this.findOne(id);
    
    // Only pending requests can be deleted
    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(`Cannot delete leave request with status ${leaveRequest.status}`);
    }
    
    const result = await this.leaveRequestRepository.delete(id);
    return !!result.affected && result.affected > 0;
  }
} 