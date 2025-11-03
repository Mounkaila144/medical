import { ReportFormat } from '../entities/report.entity';
export declare enum ReportType {
    DAILY_REVENUE = "DAILY_REVENUE",
    PRACTITIONER_KPI = "PRACTITIONER_KPI",
    OCCUPANCY_RATE = "OCCUPANCY_RATE",
    CUSTOM = "CUSTOM"
}
export declare class GenerateReportDto {
    reportType: ReportType;
    name: string;
    params: Record<string, any>;
    format?: ReportFormat;
}
