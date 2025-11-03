import { PayrollService } from '../services/payroll.service';
import { PayrollExport } from '../entities/payroll-export.entity';
import { CreatePayrollExportInput } from '../dtos/payroll-export.dto';
export declare class PayrollResolver {
    private readonly payrollService;
    constructor(payrollService: PayrollService);
    payrollExports(): Promise<PayrollExport[]>;
    payrollExportsByTenant(tenantId: string): Promise<PayrollExport[]>;
    payrollExport(id: string): Promise<PayrollExport>;
    generatePayroll(createPayrollExportInput: CreatePayrollExportInput): Promise<PayrollExport>;
    removePayrollExport(id: string): Promise<boolean>;
}
