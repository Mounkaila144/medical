import { ShiftService } from '../services/shift.service';
import { Shift } from '../entities/shift.entity';
import { CreateShiftInput, UpdateShiftInput } from '../dtos/shift.dto';
export declare class ShiftResolver {
    private readonly shiftService;
    constructor(shiftService: ShiftService);
    shifts(): Promise<Shift[]>;
    shiftsByStaff(staffId: string): Promise<Shift[]>;
    shiftsByDateRange(start: Date, end: Date): Promise<Shift[]>;
    shift(id: string): Promise<Shift>;
    createShift(createShiftInput: CreateShiftInput): Promise<Shift>;
    updateShift(id: string, updateShiftInput: UpdateShiftInput): Promise<Shift>;
    removeShift(id: string): Promise<boolean>;
}
