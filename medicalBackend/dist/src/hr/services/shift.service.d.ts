import { Repository } from 'typeorm';
import { Shift } from '../entities/shift.entity';
import { CreateShiftInput, UpdateShiftInput } from '../dtos/shift.dto';
import { StaffService } from './staff.service';
export declare class ShiftService {
    private shiftRepository;
    private staffService;
    constructor(shiftRepository: Repository<Shift>, staffService: StaffService);
    findAll(): Promise<Shift[]>;
    findByStaff(staffId: string): Promise<Shift[]>;
    findByDateRange(start: Date, end: Date): Promise<Shift[]>;
    findOne(id: string): Promise<Shift>;
    create(createShiftInput: CreateShiftInput): Promise<Shift>;
    update(id: string, updateShiftInput: UpdateShiftInput): Promise<Shift>;
    remove(id: string): Promise<boolean>;
}
