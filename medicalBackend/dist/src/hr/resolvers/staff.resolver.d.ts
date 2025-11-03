import { StaffService } from '../services/staff.service';
import { Staff } from '../entities/staff.entity';
import { CreateStaffInput, UpdateStaffInput } from '../dtos/staff.dto';
export declare class StaffResolver {
    private readonly staffService;
    constructor(staffService: StaffService);
    staff(): Promise<Staff[]>;
    staffByTenant(tenantId: string): Promise<Staff[]>;
    staffMember(id: string): Promise<Staff>;
    createStaff(createStaffInput: CreateStaffInput): Promise<Staff>;
    updateStaff(id: string, updateStaffInput: UpdateStaffInput): Promise<Staff>;
    removeStaff(id: string): Promise<boolean>;
}
