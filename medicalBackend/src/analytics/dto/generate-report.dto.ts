import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { ReportFormat } from '../entities/report.entity';

export enum ReportType {
  DAILY_REVENUE = 'DAILY_REVENUE',
  PRACTITIONER_KPI = 'PRACTITIONER_KPI',
  OCCUPANCY_RATE = 'OCCUPANCY_RATE',
  CUSTOM = 'CUSTOM',
}

export class GenerateReportDto {
  @IsNotEmpty()
  @IsEnum(ReportType)
  reportType: ReportType;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsObject()
  params: Record<string, any>;

  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;
} 