import { TimesheetService } from '../services/timesheet.service';
import { Timesheet } from '../entities/timesheet.entity';
import { CreateTimesheetInput, UpdateTimesheetInput } from '../dtos/timesheet.dto';
export declare class TimesheetResolver {
    private readonly timesheetService;
    constructor(timesheetService: TimesheetService);
    timesheets(): Promise<Timesheet[]>;
    timesheetsByStaff(staffId: string): Promise<Timesheet[]>;
    timesheetsByPeriod(month: number, year: number): Promise<Timesheet[]>;
    pendingTimesheets(): Promise<Timesheet[]>;
    timesheet(id: string): Promise<Timesheet>;
    createTimesheet(createTimesheetInput: CreateTimesheetInput): Promise<Timesheet>;
    updateTimesheet(id: string, updateTimesheetInput: UpdateTimesheetInput): Promise<Timesheet>;
    approveTimesheet(id: string): Promise<Timesheet>;
    removeTimesheet(id: string): Promise<boolean>;
}
