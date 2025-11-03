import { Repository } from 'typeorm';
import { LeaveRequest } from '../entities/leave-request.entity';
import { CreateLeaveRequestInput, UpdateLeaveRequestInput, ApproveLeaveRequestInput } from '../dtos/leave-request.dto';
import { StaffService } from './staff.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class LeaveService {
    private leaveRequestRepository;
    private staffService;
    private eventEmitter;
    constructor(leaveRequestRepository: Repository<LeaveRequest>, staffService: StaffService, eventEmitter: EventEmitter2);
    findAll(): Promise<LeaveRequest[]>;
    findByStaff(staffId: string): Promise<LeaveRequest[]>;
    findPendingRequests(): Promise<LeaveRequest[]>;
    findOne(id: string): Promise<LeaveRequest>;
    create(createLeaveRequestInput: CreateLeaveRequestInput): Promise<LeaveRequest>;
    update(id: string, updateLeaveRequestInput: UpdateLeaveRequestInput): Promise<LeaveRequest>;
    approveLeaveRequest(approveInput: ApproveLeaveRequestInput): Promise<LeaveRequest>;
    remove(id: string): Promise<boolean>;
}
