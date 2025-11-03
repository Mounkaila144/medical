import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PayrollService } from '../../services/payroll.service';
import { StaffService } from '../../services/staff.service';
import { TimesheetService } from '../../services/timesheet.service';
import { PayrollExport } from '../../entities/payroll-export.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

// Test minimal qui vérifie simplement que le service est bien défini
describe('PayrollService', () => {
  let service: PayrollService;

  beforeEach(async () => {
    const mockPayrollRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const mockStaffService = {
      findOne: jest.fn(),
      findAllByTenant: jest.fn(),
    };

    const mockTimesheetService = {
      findByPeriod: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollService,
        {
          provide: getRepositoryToken(PayrollExport),
          useValue: mockPayrollRepository,
        },
        {
          provide: StaffService,
          useValue: mockStaffService,
        },
        {
          provide: TimesheetService,
          useValue: mockTimesheetService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<PayrollService>(PayrollService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
}); 