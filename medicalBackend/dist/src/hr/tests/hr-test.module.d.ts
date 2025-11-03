import { Repository } from 'typeorm';
import { Staff } from './mocks/entities/staff.entity';
import { LeaveRequest } from './mocks/entities/leave-request.entity';
import { PayrollExport } from './mocks/entities/payroll-export.entity';
import { StaffService } from '../../hr/services/staff.service';
import { LeaveService } from '../../hr/services/leave.service';
import { PayrollService } from '../../hr/services/payroll.service';
export declare class MockGraphQLController {
    private readonly leaveService;
    private readonly staffService;
    private readonly payrollService;
    private leaveRequestRepository;
    private payrollExportRepository;
    private staffRepository;
    constructor(leaveService: LeaveService, staffService: StaffService, payrollService: PayrollService, leaveRequestRepository: Repository<LeaveRequest>, payrollExportRepository: Repository<PayrollExport>, staffRepository: Repository<Staff>);
    formatDate(date: any): string;
    createPayrollCsvFile(tenantId: string, period: string): Promise<string>;
    handleGraphQL(body: any, req: any, res: any): Promise<any>;
}
export declare class HrTestModule {
}
