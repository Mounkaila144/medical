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
exports.InvoicesController = void 0;
const common_1 = require("@nestjs/common");
const invoicing_service_1 = require("../services/invoicing.service");
const dto_1 = require("../dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../../auth/entities/user.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const invoice_entity_1 = require("../entities/invoice.entity");
let InvoicesController = class InvoicesController {
    invoicingService;
    invoiceRepository;
    constructor(invoicingService, invoiceRepository) {
        this.invoicingService = invoicingService;
        this.invoiceRepository = invoiceRepository;
    }
    async createDraft(createInvoiceDto, req) {
        return this.invoicingService.createDraft(req.user.tenantId, createInvoiceDto);
    }
    async addLine(addLineDto, req) {
        return this.invoicingService.addLine(req.user.tenantId, addLineDto);
    }
    async sendInvoice(id, data, req) {
        return this.invoicingService.send(req.user.tenantId, {
            invoiceId: id,
            status: invoice_entity_1.InvoiceStatus.SENT
        });
    }
    async send(updateStatusDto, req) {
        return this.invoicingService.send(req.user.tenantId, updateStatusDto);
    }
    async markPaid(updateStatusDto, req) {
        return this.invoicingService.markPaid(req.user.tenantId, updateStatusDto);
    }
    async remindOverdue(req) {
        return this.invoicingService.remindOverdue(req.user.tenantId);
    }
    async findAll(req, patientId, status) {
        const where = { tenantId: req.user.tenantId };
        if (patientId) {
            where.patientId = patientId;
        }
        if (status) {
            where.status = status;
        }
        return this.invoiceRepository.find({
            where,
            relations: ['patient', 'lines', 'payments'],
            order: { issueDate: 'DESC' },
        });
    }
    async findOne(id, req) {
        return this.invoiceRepository.findOne({
            where: { id, tenantId: req.user.tenantId },
            relations: ['patient', 'lines', 'payments'],
        });
    }
    async update(id, updateInvoiceDto, req) {
        await this.invoiceRepository.update({ id, tenantId: req.user.tenantId }, updateInvoiceDto);
        return this.invoiceRepository.findOne({
            where: { id, tenantId: req.user.tenantId },
            relations: ['patient', 'lines', 'payments'],
        });
    }
    async remove(id, req) {
        await this.invoiceRepository.delete({
            id,
            tenantId: req.user.tenantId,
        });
        return { message: 'Invoice deleted successfully' };
    }
    async downloadPdf(id, req, res) {
        try {
            const invoice = await this.invoiceRepository.findOne({
                where: { id, tenantId: req.user.tenantId },
            });
            if (!invoice) {
                return res.status(common_1.HttpStatus.NOT_FOUND).json({
                    message: 'Invoice not found',
                });
            }
            const pdfBuffer = await this.invoicingService.downloadPdf(id, req.user.tenantId);
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="facture-${invoice.number}.pdf"`,
                'Content-Length': pdfBuffer.length,
            });
            res.send(pdfBuffer);
        }
        catch (error) {
            console.error('Error downloading invoice PDF:', error);
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Error downloading PDF',
                error: error.message,
            });
        }
    }
    async regeneratePdf(id, req) {
        const invoice = await this.invoiceRepository.findOne({
            where: { id, tenantId: req.user.tenantId },
        });
        if (!invoice) {
            return { message: 'Invoice not found' };
        }
        await this.invoicingService.generatePdf(id, req.user.tenantId);
        return { message: 'PDF generated successfully' };
    }
};
exports.InvoicesController = InvoicesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateInvoiceDto, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "createDraft", null);
__decorate([
    (0, common_1.Post)('line'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AddInvoiceLineDto, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "addLine", null);
__decorate([
    (0, common_1.Post)(':id/send'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "sendInvoice", null);
__decorate([
    (0, common_1.Post)('send'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.UpdateInvoiceStatusDto, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "send", null);
__decorate([
    (0, common_1.Post)('mark-paid'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.UpdateInvoiceStatusDto, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "markPaid", null);
__decorate([
    (0, common_1.Post)('remind-overdue'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "remindOverdue", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('patientId')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/download/pdf'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "downloadPdf", null);
__decorate([
    (0, common_1.Post)(':id/regenerate-pdf'),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.SUPERADMIN, user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "regeneratePdf", null);
exports.InvoicesController = InvoicesController = __decorate([
    (0, common_1.Controller)('invoices'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(1, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __metadata("design:paramtypes", [invoicing_service_1.InvoicingService,
        typeorm_2.Repository])
], InvoicesController);
//# sourceMappingURL=invoices.controller.js.map