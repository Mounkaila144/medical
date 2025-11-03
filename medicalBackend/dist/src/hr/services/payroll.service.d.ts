import { Repository } from 'typeorm';
import { PayrollExport } from '../entities/payroll-export.entity';
import { CreatePayrollExportInput } from '../dtos/payroll-export.dto';
import { StaffService } from './staff.service';
import { TimesheetService } from './timesheet.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class PayrollService {
    private payrollExportRepository;
    private staffService;
    private timesheetService;
    private eventEmitter;
    constructor(payrollExportRepository: Repository<PayrollExport>, staffService: StaffService, timesheetService: TimesheetService, eventEmitter: EventEmitter2);
    findAll(): Promise<PayrollExport[]>;
    findByTenant(tenantId: string): Promise<PayrollExport[]>;
    findOne(id: string): Promise<PayrollExport>;
    generateCsv(createPayrollExportInput: CreatePayrollExportInput): Promise<PayrollExport>;
    remove(id: string): Promise<boolean>;
}
