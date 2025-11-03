import { Tenant } from '../../auth/entities/tenant.entity';
import { StaffRole } from '../enums/staff-role.enum';
import { Shift } from './shift.entity';
import { LeaveRequest } from './leave-request.entity';
import { Timesheet } from './timesheet.entity';
export declare class Staff {
    id: string;
    tenantId: string;
    tenant: Tenant;
    firstName: string;
    lastName: string;
    role: StaffRole;
    hireDate: Date;
    salary: number;
    createdAt: Date;
    updatedAt: Date;
    shifts: Shift[];
    leaveRequests: LeaveRequest[];
    timesheets: Timesheet[];
}
