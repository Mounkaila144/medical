export enum ReportType {
  DAILY_REVENUE = 'DAILY_REVENUE',
  PRACTITIONER_KPI = 'PRACTITIONER_KPI',
  OCCUPANCY_RATE = 'OCCUPANCY_RATE',
  CUSTOM = 'CUSTOM',
}

export enum ReportFormat {
  PDF = 'PDF',
  CSV = 'CSV',
}

export interface Report {
  id: string;
  tenantId: string;
  name: string;
  params: Record<string, any>;
  generatedPath: string;
  format: ReportFormat;
  createdAt: string;
}