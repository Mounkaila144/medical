import { Tenant } from './tenant.entity';
import { Shift } from './shift.entity';
import { LeaveRequest } from './leave-request.entity';
import { Timesheet } from './timesheet.entity';
export declare enum StaffRole {
    DOCTOR = "DOCTOR",
    NURSE = "NURSE",
    RECEPTIONIST = "RECEPTIONIST",
    ADMIN = "ADMIN"
}
export declare class Staff {
    id: string;
    tenantId: string;
    tenant: Tenant;
    firstName: string;
    lastName: string;
    role: string;
    hireDate: Date;
    salary: number;
    createdAt: Date;
    updatedAt: Date;
    shifts: Shift[];
    leaveRequests: LeaveRequest[];
    timesheets: Timesheet[];
}
