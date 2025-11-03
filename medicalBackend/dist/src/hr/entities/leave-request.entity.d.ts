import { Staff } from './staff.entity';
import { LeaveStatus } from '../enums/leave-status.enum';
export declare class LeaveRequest {
    id: string;
    staffId: string;
    staff: Staff;
    start: Date;
    end: Date;
    status: LeaveStatus;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}
