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
exports.PayrollResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const payroll_service_1 = require("../services/payroll.service");
const payroll_export_dto_1 = require("../dtos/payroll-export.dto");
let PayrollResolver = class PayrollResolver {
    payrollService;
    constructor(payrollService) {
        this.payrollService = payrollService;
    }
    async payrollExports() {
        return this.payrollService.findAll();
    }
    async payrollExportsByTenant(tenantId) {
        return this.payrollService.findByTenant(tenantId);
    }
    async payrollExport(id) {
        return this.payrollService.findOne(id);
    }
    async generatePayroll(createPayrollExportInput) {
        return this.payrollService.generateCsv(createPayrollExportInput);
    }
    async removePayrollExport(id) {
        return this.payrollService.remove(id);
    }
};
exports.PayrollResolver = PayrollResolver;
__decorate([
    (0, graphql_1.Query)(() => [payroll_export_dto_1.PayrollExportDto]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayrollResolver.prototype, "payrollExports", null);
__decorate([
    (0, graphql_1.Query)(() => [payroll_export_dto_1.PayrollExportDto]),
    __param(0, (0, graphql_1.Args)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PayrollResolver.prototype, "payrollExportsByTenant", null);
__decorate([
    (0, graphql_1.Query)(() => payroll_export_dto_1.PayrollExportDto),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PayrollResolver.prototype, "payrollExport", null);
__decorate([
    (0, graphql_1.Mutation)(() => payroll_export_dto_1.PayrollExportDto),
    __param(0, (0, graphql_1.Args)('createPayrollExportInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payroll_export_dto_1.CreatePayrollExportInput]),
    __metadata("design:returntype", Promise)
], PayrollResolver.prototype, "generatePayroll", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PayrollResolver.prototype, "removePayrollExport", null);
exports.PayrollResolver = PayrollResolver = __decorate([
    (0, graphql_1.Resolver)(() => payroll_export_dto_1.PayrollExportDto),
    __metadata("design:paramtypes", [payroll_service_1.PayrollService])
], PayrollResolver);
//# sourceMappingURL=payroll.resolver.js.map