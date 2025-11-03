import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollExport } from '../entities/payroll-export.entity';
import { CreatePayrollExportInput } from '../dtos/payroll-export.dto';
import { StaffService } from './staff.service';
import { TimesheetService } from './timesheet.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fs from 'fs';
import * as path from 'path';
import { stringify } from 'csv-stringify/sync';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(PayrollExport)
    private payrollExportRepository: Repository<PayrollExport>,
    private staffService: StaffService,
    private timesheetService: TimesheetService,
    private eventEmitter: EventEmitter2,
  ) {}

  async findAll(): Promise<PayrollExport[]> {
    return this.payrollExportRepository.find({ order: { generatedAt: 'DESC' } });
  }

  async findByTenant(tenantId: string): Promise<PayrollExport[]> {
    return this.payrollExportRepository.find({ 
      where: { tenantId },
      order: { generatedAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<PayrollExport> {
    const payrollExport = await this.payrollExportRepository.findOne({ where: { id } });
    if (!payrollExport) {
      throw new NotFoundException(`Payroll export with ID ${id} not found`);
    }
    return payrollExport;
  }

  async generateCsv(createPayrollExportInput: CreatePayrollExportInput): Promise<PayrollExport> {
    const { tenantId, period } = createPayrollExportInput;
    
    // Parse period (expected format: MM/YYYY)
    const [month, year] = period.split('/').map(part => parseInt(part, 10));
    if (!month || !year || isNaN(month) || isNaN(year) || month < 1 || month > 12) {
      throw new BadRequestException('Invalid period format. Use MM/YYYY');
    }
    
    // Get all staff for tenant
    const staff = await this.staffService.findAllByTenant(tenantId);
    if (staff.length === 0) {
      throw new BadRequestException(`No staff found for tenant ${tenantId}`);
    }
    
    // Get timesheets for the period
    const timesheets = await this.timesheetService.findByPeriod(month, year);
    
    // Create directory if it doesn't exist
    const dirPath = path.resolve(process.cwd(), 'exports', 'payroll', tenantId);
    await mkdir(dirPath, { recursive: true });
    
    // Generate file name
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `payroll_${period.replace('/', '-')}_${timestamp}.csv`;
    const filePath = path.join(dirPath, fileName);
    const relativeFilePath = path.join('exports', 'payroll', tenantId, fileName);
    
    // Prepare CSV data
    const csvData = staff.map(staffMember => {
      const timesheet = timesheets.find(ts => ts.staffId === staffMember.id);
      
      return {
        StaffID: staffMember.id,
        FirstName: staffMember.firstName,
        LastName: staffMember.lastName,
        Role: staffMember.role,
        BaseSalary: staffMember.salary,
        Hours: timesheet ? timesheet.hours : 0,
        Approved: timesheet ? (timesheet.approved ? 'Yes' : 'No') : 'No',
        TotalPay: timesheet && timesheet.approved ? 
          parseFloat(staffMember.salary.toString()) : 0
      };
    });
    
    // Write to CSV
    const csvContent = stringify(csvData, { header: true });
    await writeFile(filePath, csvContent);
    
    // Create payroll export record
    const payrollExport = this.payrollExportRepository.create({
      tenantId,
      period,
      filePath: relativeFilePath,
      generatedAt: new Date()
    });
    
    const savedExport = await this.payrollExportRepository.save(payrollExport);
    
    // Emit event
    this.eventEmitter.emit('payroll.generated', savedExport);
    
    return savedExport;
  }

  async remove(id: string): Promise<boolean> {
    const payrollExport = await this.findOne(id);
    
    // Delete the file
    try {
      await promisify(fs.unlink)(path.resolve(process.cwd(), payrollExport.filePath));
    } catch (error) {
      // File might not exist, continue with deletion from database
      console.warn(`Could not delete file ${payrollExport.filePath}: ${error.message}`);
    }
    
    const result = await this.payrollExportRepository.delete(id);
    return !!result.affected && result.affected > 0;
  }
} 