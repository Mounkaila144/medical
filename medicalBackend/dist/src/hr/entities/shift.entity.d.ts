import { Staff } from './staff.entity';
export declare class Shift {
    id: string;
    staffId: string;
    staff: Staff;
    startAt: Date;
    endAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
