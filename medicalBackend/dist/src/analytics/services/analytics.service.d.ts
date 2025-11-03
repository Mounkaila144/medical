import { Repository, DataSource } from 'typeorm';
import { Report } from '../entities/report.entity';
import { GenerateReportDto } from '../dto/generate-report.dto';
import { ConfigService } from '@nestjs/config';
export declare class AnalyticsService {
    private reportRepository;
    private configService;
    private dataSource;
    constructor(reportRepository: Repository<Report>, configService: ConfigService, dataSource: DataSource);
    generate(tenantId: string, generateReportDto: GenerateReportDto): Promise<Report>;
    private fetchReportData;
    private generateMockDailyRevenue;
    private generateMockPractitionerKPI;
    private generateMockOccupancyRate;
    private generateFile;
    private generatePDF;
    private generateCSV;
    refreshMaterializedViews(): Promise<void>;
    getDashboardData(tenantId: string, period?: string): Promise<{
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
    private getTotalPatients;
    private getTodayAppointments;
    private getPendingInvoices;
    private getMonthlyRevenue;
    private getAppointmentsByStatus;
    private getRecentAppointments;
    private getUpcomingAppointments;
    private getAppointmentsOverview;
    private getAlerts;
}
