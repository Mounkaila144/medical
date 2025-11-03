import { Staff } from './staff.entity';
export declare enum LeaveStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
export declare class LeaveRequest {
    id: string;
    staffId: string;
    staff: Staff;
    start: Date;
    end: Date;
    status: string;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}
