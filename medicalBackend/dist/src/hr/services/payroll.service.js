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
exports.PayrollService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payroll_export_entity_1 = require("../entities/payroll-export.entity");
const staff_service_1 = require("./staff.service");
const timesheet_service_1 = require("./timesheet.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const fs = require("fs");
const path = require("path");
const sync_1 = require("csv-stringify/sync");
const util_1 = require("util");
const writeFile = (0, util_1.promisify)(fs.writeFile);
const mkdir = (0, util_1.promisify)(fs.mkdir);
let PayrollService = class PayrollService {
    payrollExportRepository;
    staffService;
    timesheetService;
    eventEmitter;
    constructor(payrollExportRepository, staffService, timesheetService, eventEmitter) {
        this.payrollExportRepository = payrollExportRepository;
        this.staffService = staffService;
        this.timesheetService = timesheetService;
        this.eventEmitter = eventEmitter;
    }
    async findAll() {
        return this.payrollExportRepository.find({ order: { generatedAt: 'DESC' } });
    }
    async findByTenant(tenantId) {
        return this.payrollExportRepository.find({
            where: { tenantId },
            order: { generatedAt: 'DESC' }
        });
    }
    async findOne(id) {
        const payrollExport = await this.payrollExportRepository.findOne({ where: { id } });
        if (!payrollExport) {
            throw new common_1.NotFoundException(`Payroll export with ID ${id} not found`);
        }
        return payrollExport;
    }
    async generateCsv(createPayrollExportInput) {
        const { tenantId, period } = createPayrollExportInput;
        const [month, year] = period.split('/').map(part => parseInt(part, 10));
        if (!month || !year || isNaN(month) || isNaN(year) || month < 1 || month > 12) {
            throw new common_1.BadRequestException('Invalid period format. Use MM/YYYY');
        }
        const staff = await this.staffService.findAllByTenant(tenantId);
        if (staff.length === 0) {
            throw new common_1.BadRequestException(`No staff found for tenant ${tenantId}`);
        }
        const timesheets = await this.timesheetService.findByPeriod(month, year);
        const dirPath = path.resolve(process.cwd(), 'exports', 'payroll', tenantId);
        await mkdir(dirPath, { recursive: true });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `payroll_${period.replace('/', '-')}_${timestamp}.csv`;
        const filePath = path.join(dirPath, fileName);
        const relativeFilePath = path.join('exports', 'payroll', tenantId, fileName);
        const csvData = staff.map(staffMember => {
            const timesheet = timesheets.find(ts => ts.staffId === staffMember.id);
            return {
                StaffID: staffMember.id,
                FirstName: staffMember.firstName,
                LastName: staffMember.lastName,
                Role: staffMember.role,
                BaseSalary: staffMember.salary,
                Hours: timesheet ? timesheet.hours : 0,
                Approved: timesheet ? (timesheet.approved ? 'Yes' : 'No') : 'No',
                TotalPay: timesheet && timesheet.approved ?
                    parseFloat(staffMember.salary.toString()) : 0
            };
        });
        const csvContent = (0, sync_1.stringify)(csvData, { header: true });
        await writeFile(filePath, csvContent);
        const payrollExport = this.payrollExportRepository.create({
            tenantId,
            period,
            filePath: relativeFilePath,
            generatedAt: new Date()
        });
        const savedExport = await this.payrollExportRepository.save(payrollExport);
        this.eventEmitter.emit('payroll.generated', savedExport);
        return savedExport;
    }
    async remove(id) {
        const payrollExport = await this.findOne(id);
        try {
            await (0, util_1.promisify)(fs.unlink)(path.resolve(process.cwd(), payrollExport.filePath));
        }
        catch (error) {
            console.warn(`Could not delete file ${payrollExport.filePath}: ${error.message}`);
        }
        const result = await this.payrollExportRepository.delete(id);
        return !!result.affected && result.affected > 0;
    }
};
exports.PayrollService = PayrollService;
exports.PayrollService = PayrollService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payroll_export_entity_1.PayrollExport)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        staff_service_1.StaffService,
        timesheet_service_1.TimesheetService,
        event_emitter_1.EventEmitter2])
], PayrollService);
//# sourceMappingURL=payroll.service.js.map