import { Staff } from './staff.entity';
export declare class Timesheet {
    id: string;
    staffId: string;
    staff: Staff;
    month: number;
    year: number;
    hours: number;
    approved: boolean;
    createdAt: Date;
    updatedAt: Date;
}
