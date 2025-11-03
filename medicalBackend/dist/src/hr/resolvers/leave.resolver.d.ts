import { LeaveService } from '../services/leave.service';
import { LeaveRequest } from '../entities/leave-request.entity';
import { CreateLeaveRequestInput, UpdateLeaveRequestInput, ApproveLeaveRequestInput } from '../dtos/leave-request.dto';
export declare class LeaveResolver {
    private readonly leaveService;
    constructor(leaveService: LeaveService);
    leaveRequests(): Promise<LeaveRequest[]>;
    leaveRequestsByStaff(staffId: string): Promise<LeaveRequest[]>;
    pendingLeaveRequests(): Promise<LeaveRequest[]>;
    leaveRequest(id: string): Promise<LeaveRequest>;
    createLeaveRequest(createLeaveRequestInput: CreateLeaveRequestInput): Promise<LeaveRequest>;
    updateLeaveRequest(id: string, updateLeaveRequestInput: UpdateLeaveRequestInput): Promise<LeaveRequest>;
    approveLeaveRequest(approveLeaveRequestInput: ApproveLeaveRequestInput): Promise<LeaveRequest>;
    removeLeaveRequest(id: string): Promise<boolean>;
}
