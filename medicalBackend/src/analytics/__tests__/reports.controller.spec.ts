import { Test } from '@nestjs/testing';
import { ReportsController } from '../controllers/reports.controller';
import { AnalyticsService } from '../services/analytics.service';
import { Report, ReportFormat } from '../entities/report.entity';
import { ReportType } from '../dto/generate-report.dto';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ReportsController', () => {
  let reportsController: ReportsController;
  let analyticsService: AnalyticsService;
  let mockReportRepository;
  
  const mockReport = {
    id: 'report-1',
    tenantId: 'tenant-1',
    name: 'Test Report',
    params: { startDate: '2023-01-01', endDate: '2023-01-31' },
    generatedPath: 'storage/reports/tenant-1/Test_Report_123456789.pdf',
    format: ReportFormat.PDF,
    createdAt: new Date(),
  };
  
  beforeEach(async () => {
    // Réinitialiser les mocks avant chaque test
    mockReportRepository = {
      find: jest.fn().mockResolvedValue([mockReport]),
      findOne: jest.fn().mockImplementation((options) => {
        if (options.where.id === 'non-existent') {
          return Promise.resolve(null);
        }
        return Promise.resolve(mockReport);
      }),
    };
    
    const mockAnalyticsService = {
      generate: jest.fn().mockResolvedValue(mockReport),
      refreshMaterializedViews: jest.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: mockAnalyticsService,
        },
        {
          provide: getRepositoryToken(Report),
          useValue: mockReportRepository,
        },
      ],
    }).compile();

    reportsController = moduleRef.get<ReportsController>(ReportsController);
    analyticsService = moduleRef.get<AnalyticsService>(AnalyticsService);
  });

  describe('generateReport', () => {
    it('should generate a new report', async () => {
      const req = { user: { tenantId: 'tenant-1' } };
      const generateReportDto = {
        reportType: ReportType.DAILY_REVENUE,
        name: 'Daily Revenue Report',
        params: {
          startDate: '2023-01-01',
          endDate: '2023-01-31',
        },
        format: ReportFormat.PDF,
      };

      const result = await reportsController.generateReport(generateReportDto, req);
      
      expect(analyticsService.generate).toHaveBeenCalledWith(
        req.user.tenantId,
        generateReportDto
      );
      expect(result).toEqual(mockReport);
    });
  });

  describe('getAllReports', () => {
    it('should return all reports for the tenant', async () => {
      const req = { user: { tenantId: 'tenant-1' } };
      
      const result = await reportsController.getAllReports(req);
      
      expect(mockReportRepository.find).toHaveBeenCalledWith({
        where: { tenantId: req.user.tenantId },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([mockReport]);
    });
  });

  describe('getReportById', () => {
    it('should return a specific report', async () => {
      const req = { user: { tenantId: 'tenant-1' } };
      const id = 'report-1';
      
      const result = await reportsController.getReportById(id, req);
      
      expect(mockReportRepository.findOne).toHaveBeenCalledWith({
        where: { id, tenantId: req.user.tenantId },
      });
      expect(result).toEqual(mockReport);
    });

    it('should throw NotFoundException when report not found', async () => {
      const req = { user: { tenantId: 'tenant-1' } };
      const id = 'non-existent';
      
      await expect(reportsController.getReportById(id, req)).rejects.toThrow(NotFoundException);
      expect(mockReportRepository.findOne).toHaveBeenCalledWith({
        where: { id, tenantId: req.user.tenantId },
      });
    });
  });

  describe('refreshMaterializedViews', () => {
    it('should refresh all materialized views', async () => {
      const result = await reportsController.refreshMaterializedViews();
      
      expect(analyticsService.refreshMaterializedViews).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Materialized views refreshed successfully' });
    });
  });
}); 