import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';

// Entités adaptées pour SQLite
import { Staff } from '../mocks/entities/staff.entity';
import { Shift } from '../mocks/entities/shift.entity';
import { LeaveRequest } from '../mocks/entities/leave-request.entity';
import { Timesheet } from '../mocks/entities/timesheet.entity';
import { PayrollExport } from '../mocks/entities/payroll-export.entity';
import { Tenant } from '../mocks/entities/tenant.entity';

// Services
import { StaffService } from '../../../hr/services/staff.service';
import { ShiftService } from '../../../hr/services/shift.service';
import { LeaveService } from '../../../hr/services/leave.service';
import { TimesheetService } from '../../../hr/services/timesheet.service';
import { PayrollService } from '../../../hr/services/payroll.service';

// Resolvers
import { StaffResolver } from '../../../hr/resolvers/staff.resolver';
import { ShiftResolver } from '../../../hr/resolvers/shift.resolver';
import { LeaveResolver } from '../../../hr/resolvers/leave.resolver';
import { TimesheetResolver } from '../../../hr/resolvers/timesheet.resolver';
import { PayrollResolver } from '../../../hr/resolvers/payroll.resolver';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [
        Staff, 
        Shift, 
        LeaveRequest, 
        Timesheet, 
        PayrollExport,
        Tenant
      ],
      synchronize: true,
      logging: false,
    }),
    TypeOrmModule.forFeature([
      Staff, 
      Shift, 
      LeaveRequest, 
      Timesheet, 
      PayrollExport,
      Tenant
    ]),
    EventEmitterModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
    }),
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
    TypeOrmModule,
    StaffService,
    ShiftService,
    LeaveService,
    TimesheetService,
    PayrollService
  ]
})
export class HrCoreModule {} 