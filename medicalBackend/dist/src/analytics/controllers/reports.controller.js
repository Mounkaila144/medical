"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const analytics_service_1 = require("../services/analytics.service");
const generate_report_dto_1 = require("../dto/generate-report.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../../auth/entities/user.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const report_entity_1 = require("../entities/report.entity");
const fs = require("fs");
const path = require("path");
let ReportsController = class ReportsController {
    analyticsService;
    reportRepository;
    constructor(analyticsService, reportRepository) {
        this.analyticsService = analyticsService;
        this.reportRepository = reportRepository;
    }
    async generateReport(generateReportDto, req) {
        return this.analyticsService.generate(req.user.tenantId, generateReportDto);
    }
    async getAllReports(req) {
        return this.reportRepository.find({
            where: { tenantId: req.user.tenantId },
            order: { createdAt: 'DESC' },
        });
    }
    async getDashboardAnalytics(period = 'MONTHLY', req) {
        return this.analyticsService.getDashboardData(req.user.tenantId, period);
    }
    async getReportById(id, req) {
        const report = await this.reportRepository.findOne({
            where: { id, tenantId: req.user.tenantId },
        });
        if (!report) {
            throw new common_1.NotFoundException(`Report with ID ${id} not found`);
        }
        return report;
    }
    async downloadReport(id, req, res) {
        const report = await this.reportRepository.findOne({
            where: { id, tenantId: req.user.tenantId },
        });
        if (!report) {
            throw new common_1.NotFoundException(`Report with ID ${id} not found`);
        }
        const filePath = path.resolve(report.generatedPath);
        if (!fs.existsSync(filePath)) {
            throw new common_1.NotFoundException(`Report file not found`);
        }
        const contentType = report.format === 'PDF' ? 'application/pdf' : 'text/csv';
        const fileName = path.basename(filePath);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    }
    async testDatabase(req) {
        try {
            console.log('Testing database connection...');
            const count = await this.reportRepository.count();
            console.log('Report count:', count);
            const testReport = this.reportRepository.create({
                tenantId: req.user.tenantId,
                name: 'Test Report',
                params: { test: true },
                generatedPath: '/tmp/test.pdf',
                format: 'PDF',
            });
            console.log('Test report created:', testReport);
            const savedReport = await this.reportRepository.save(testReport);
            console.log('Test report saved:', savedReport);
            return { success: true, reportId: savedReport.id };
        }
        catch (error) {
            console.error('Database test error:', error);
            console.error('Error stack:', error.stack);
            throw error;
        }
    }
    async refreshMaterializedViews() {
        await this.analyticsService.refreshMaterializedViews();
        return { message: 'Materialized views refreshed successfully' };
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_report_dto_1.GenerateReportDto, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "generateReport", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getAllReports", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getDashboardAnalytics", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getReportById", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "downloadReport", null);
__decorate([
    (0, common_1.Post)('test-db'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "testDatabase", null);
__decorate([
    (0, common_1.Post)('refresh-views'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "refreshMaterializedViews", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(1, (0, typeorm_1.InjectRepository)(report_entity_1.Report)),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService,
        typeorm_2.Repository])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map