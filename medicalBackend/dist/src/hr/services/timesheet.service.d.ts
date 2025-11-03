import { Repository } from 'typeorm';
import { Timesheet } from '../entities/timesheet.entity';
import { CreateTimesheetInput, UpdateTimesheetInput } from '../dtos/timesheet.dto';
import { StaffService } from './staff.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class TimesheetService {
    private timesheetRepository;
    private staffService;
    private eventEmitter;
    constructor(timesheetRepository: Repository<Timesheet>, staffService: StaffService, eventEmitter: EventEmitter2);
    findAll(): Promise<Timesheet[]>;
    findByStaff(staffId: string): Promise<Timesheet[]>;
    findByPeriod(month: number, year: number): Promise<Timesheet[]>;
    findPendingApproval(): Promise<Timesheet[]>;
    findOne(id: string): Promise<Timesheet>;
    create(createTimesheetInput: CreateTimesheetInput): Promise<Timesheet>;
    update(id: string, updateTimesheetInput: UpdateTimesheetInput): Promise<Timesheet>;
    remove(id: string): Promise<boolean>;
}
