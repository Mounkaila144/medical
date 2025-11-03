import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { Shift } from './entities/shift.entity';
import { LeaveRequest } from './entities/leave-request.entity';
import { Timesheet } from './entities/timesheet.entity';
import { PayrollExport } from './entities/payroll-export.entity';
import { StaffService } from './services/staff.service';
import { ShiftService } from './services/shift.service';
import { LeaveService } from './services/leave.service';
import { TimesheetService } from './services/timesheet.service';
import { PayrollService } from './services/payroll.service';
import { StaffResolver } from './resolvers/staff.resolver';
import { ShiftResolver } from './resolvers/shift.resolver';
import { LeaveResolver } from './resolvers/leave.resolver';
import { TimesheetResolver } from './resolvers/timesheet.resolver';
import { PayrollResolver } from './resolvers/payroll.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Staff,
      Shift,
      LeaveRequest,
      Timesheet,
      PayrollExport,
    ]),
  ],
  providers: [
    StaffService,
    ShiftService,
    LeaveService,
    TimesheetService,
    PayrollService,
    StaffResolver,
    ShiftResolver,
    LeaveResolver,
    TimesheetResolver,
    PayrollResolver,
  ],
  exports: [
    StaffService,
    ShiftService,
    LeaveService,
    TimesheetService,
    PayrollService,
  ],
})
export class HrModule {} 