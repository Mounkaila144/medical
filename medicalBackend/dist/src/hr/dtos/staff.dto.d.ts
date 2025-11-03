import { StaffRole } from '../enums/staff-role.enum';
export declare class StaffDto {
    id: string;
    tenantId: string;
    firstName: string;
    lastName: string;
    role: StaffRole;
    hireDate: Date;
    salary: number;
}
export declare class CreateStaffInput {
    tenantId: string;
    firstName: string;
    lastName: string;
    role: StaffRole;
    hireDate: Date;
    salary: number;
}
export declare class UpdateStaffInput {
    firstName?: string;
    lastName?: string;
    role?: StaffRole;
    hireDate?: Date;
    salary?: number;
}
