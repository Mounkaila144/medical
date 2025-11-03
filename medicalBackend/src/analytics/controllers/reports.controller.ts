import { Controller, Get, Post, Body, Param, Req, Res, UseGuards, NotFoundException, Query } from '@nestjs/common';
import { Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { GenerateReportDto } from '../dto/generate-report.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUserRole } from '../../auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../entities/report.entity';
import * as fs from 'fs';
import * as path from 'path';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
  ) {}

  @Post('generate')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async generateReport(@Body() generateReportDto: GenerateReportDto, @Req() req) {
    return this.analyticsService.generate(req.user.tenantId, generateReportDto);
  }

  @Get()
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async getAllReports(@Req() req) {
    return this.reportRepository.find({
      where: { tenantId: req.user.tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  @Get('dashboard')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async getDashboardAnalytics(@Query('period') period: string = 'MONTHLY', @Req() req) {
    return this.analyticsService.getDashboardData(req.user.tenantId, period);
  }

  @Get(':id')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async getReportById(@Param('id') id: string, @Req() req) {
    const report = await this.reportRepository.findOne({
      where: { id, tenantId: req.user.tenantId },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    return report;
  }

  @Get(':id/download')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async downloadReport(@Param('id') id: string, @Req() req, @Res() res: Response) {
    const report = await this.reportRepository.findOne({
      where: { id, tenantId: req.user.tenantId },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    const filePath = path.resolve(report.generatedPath);
    
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Report file not found`);
    }

    const contentType = report.format === 'PDF' ? 'application/pdf' : 'text/csv';
    const fileName = path.basename(filePath);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }

  @Post('test-db')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async testDatabase(@Req() req) {
    try {
      console.log('Testing database connection...');
      
      // Test 1: Simple query
      const count = await this.reportRepository.count();
      console.log('Report count:', count);
      
      // Test 2: Create a simple report entity
      const testReport = this.reportRepository.create({
        tenantId: req.user.tenantId,
        name: 'Test Report',
        params: { test: true },
        generatedPath: '/tmp/test.pdf',
        format: 'PDF' as any,
      });
      console.log('Test report created:', testReport);
      
      // Test 3: Save the report
      const savedReport = await this.reportRepository.save(testReport);
      console.log('Test report saved:', savedReport);
      
      return { success: true, reportId: savedReport.id };
    } catch (error) {
      console.error('Database test error:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  @Post('refresh-views')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN)
  async refreshMaterializedViews() {
    await this.analyticsService.refreshMaterializedViews();
    return { message: 'Materialized views refreshed successfully' };
  }
} 