import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { PayrollService } from '../services/payroll.service';
import { PayrollExport } from '../entities/payroll-export.entity';
import { PayrollExportDto, CreatePayrollExportInput } from '../dtos/payroll-export.dto';

@Resolver(() => PayrollExportDto)
export class PayrollResolver {
  constructor(private readonly payrollService: PayrollService) {}

  @Query(() => [PayrollExportDto])
  async payrollExports(): Promise<PayrollExport[]> {
    return this.payrollService.findAll();
  }

  @Query(() => [PayrollExportDto])
  async payrollExportsByTenant(@Args('tenantId') tenantId: string): Promise<PayrollExport[]> {
    return this.payrollService.findByTenant(tenantId);
  }

  @Query(() => PayrollExportDto)
  async payrollExport(@Args('id') id: string): Promise<PayrollExport> {
    return this.payrollService.findOne(id);
  }

  @Mutation(() => PayrollExportDto)
  async generatePayroll(
    @Args('createPayrollExportInput') createPayrollExportInput: CreatePayrollExportInput,
  ): Promise<PayrollExport> {
    return this.payrollService.generateCsv(createPayrollExportInput);
  }

  @Mutation(() => Boolean)
  async removePayrollExport(@Args('id') id: string): Promise<boolean> {
    return this.payrollService.remove(id);
  }
} 