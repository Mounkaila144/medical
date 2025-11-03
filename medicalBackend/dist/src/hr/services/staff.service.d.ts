import { Repository } from 'typeorm';
import { Staff } from '../entities/staff.entity';
import { CreateStaffInput, UpdateStaffInput } from '../dtos/staff.dto';
export declare class StaffService {
    private staffRepository;
    constructor(staffRepository: Repository<Staff>);
    findAll(): Promise<Staff[]>;
    findAllByTenant(tenantId: string): Promise<Staff[]>;
    findOne(id: string): Promise<Staff>;
    create(createStaffInput: CreateStaffInput): Promise<Staff>;
    update(id: string, updateStaffInput: UpdateStaffInput): Promise<Staff>;
    remove(id: string): Promise<boolean>;
}
