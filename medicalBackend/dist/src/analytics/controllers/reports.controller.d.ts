import { Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { GenerateReportDto } from '../dto/generate-report.dto';
import { Repository } from 'typeorm';
import { Report } from '../entities/report.entity';
export declare class ReportsController {
    private readonly analyticsService;
    private reportRepository;
    constructor(analyticsService: AnalyticsService, reportRepository: Repository<Report>);
    generateReport(generateReportDto: GenerateReportDto, req: any): Promise<Report>;
    getAllReports(req: any): Promise<Report[]>;
    getDashboardAnalytics(period: string | undefined, req: any): Promise<{
        period: string;
        tenantId: string;
        metrics: {
            totalPatients: number;
            totalAppointments: number;
            totalRevenue: number;
            averageWaitTime: number;
        };
        appointmentsByStatus: any;
        recentAppointments: any[];
        upcomingAppointments: any[];
        appointmentsOverview: any[];
        pendingInvoices: number;
        alerts: any[];
    }>;
    getReportById(id: string, req: any): Promise<Report>;
    downloadReport(id: string, req: any, res: Response): Promise<void>;
    testDatabase(req: any): Promise<{
        success: boolean;
        reportId: string;
    }>;
    refreshMaterializedViews(): Promise<{
        message: string;
    }>;
}
