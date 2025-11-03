import { LeaveStatus } from '../enums/leave-status.enum';
export declare class LeaveRequestDto {
    id: string;
    staffId: string;
    start: Date;
    end: Date;
    status: LeaveStatus;
}
export declare class CreateLeaveRequestInput {
    staffId: string;
    start: Date;
    end: Date;
}
export declare class UpdateLeaveRequestInput {
    status: LeaveStatus;
}
export declare class ApproveLeaveRequestInput {
    id: string;
    status: LeaveStatus;
    comment?: string;
}
