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
exports.AppointmentsController = void 0;
const common_1 = require("@nestjs/common");
const scheduling_service_1 = require("../services/scheduling.service");
const create_appointment_dto_1 = require("../dto/create-appointment.dto");
const reschedule_appointment_dto_1 = require("../dto/reschedule-appointment.dto");
const cancel_appointment_dto_1 = require("../dto/cancel-appointment.dto");
const tenant_id_decorator_1 = require("../../common/decorators/tenant-id.decorator");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const tenant_guard_1 = require("../../common/guards/tenant.guard");
let AppointmentsController = class AppointmentsController {
    schedulingService;
    constructor(schedulingService) {
        this.schedulingService = schedulingService;
    }
    async test() {
        return { message: 'Appointments controller is working' };
    }
    async debug() {
        try {
            return { message: 'Debug endpoint working' };
        }
        catch (error) {
            return { message: `Error: ${error.message}` };
        }
    }
    async create(tenantId, createAppointmentDto) {
        console.log('Creating appointment with data:', {
            tenantId,
            ...createAppointmentDto,
        });
        return await this.schedulingService.book(tenantId, createAppointmentDto);
    }
    async getAll(tenantId, dateString, practitionerId) {
        if (practitionerId && dateString) {
            const date = new Date(dateString);
            return this.schedulingService.listAgenda(tenantId, practitionerId, date);
        }
        return this.schedulingService.getAllAppointments(tenantId, dateString);
    }
    async getById(tenantId, appointmentId) {
        return this.schedulingService.getAppointmentById(tenantId, appointmentId);
    }
    async update(tenantId, appointmentId, updateData) {
        return this.schedulingService.updateAppointment(tenantId, appointmentId, updateData);
    }
    async reschedule(tenantId, rescheduleDto) {
        return this.schedulingService.reschedule(tenantId, rescheduleDto);
    }
    async cancel(tenantId, appointmentId, cancelDto) {
        return this.schedulingService.cancel(tenantId, appointmentId, cancelDto);
    }
    async cancelPatch(tenantId, appointmentId, cancelDto) {
        return this.schedulingService.cancel(tenantId, appointmentId, cancelDto);
    }
    async getPractitionerAppointments(tenantId, practitionerId, dateString) {
        const date = dateString ? new Date(dateString) : new Date();
        return this.schedulingService.listAgenda(tenantId, practitionerId, date);
    }
};
exports.AppointmentsController = AppointmentsController;
__decorate([
    (0, common_1.Get)('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "test", null);
__decorate([
    (0, common_1.Get)('debug'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "debug", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_appointment_dto_1.CreateAppointmentDto]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Query)('practitionerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "getById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Put)('reschedule'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reschedule_appointment_dto_1.RescheduleAppointmentDto]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "reschedule", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, cancel_appointment_dto_1.CancelAppointmentDto]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "cancel", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, cancel_appointment_dto_1.CancelAppointmentDto]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "cancelPatch", null);
__decorate([
    (0, common_1.Get)('practitioner/:practitionerId'),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, common_1.Param)('practitionerId')),
    __param(2, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "getPractitionerAppointments", null);
exports.AppointmentsController = AppointmentsController = __decorate([
    (0, common_1.Controller)('appointments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard),
    __metadata("design:paramtypes", [scheduling_service_1.SchedulingService])
], AppointmentsController);
//# sourceMappingURL=appointments.controller.js.map