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
exports.PractitionerScheduleController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const scheduling_service_1 = require("../services/scheduling.service");
const practitioner_auth_service_1 = require("../../auth/services/practitioner-auth.service");
let PractitionerScheduleController = class PractitionerScheduleController {
    schedulingService;
    practitionerAuthService;
    constructor(schedulingService, practitionerAuthService) {
        this.schedulingService = schedulingService;
        this.practitionerAuthService = practitionerAuthService;
    }
    async getMyAppointments(user, dateString) {
        const practitioner = await this.practitionerAuthService.getPractitionerByUserId(user.id);
        if (dateString) {
            const date = new Date(dateString);
            return this.schedulingService.listAgenda(practitioner.tenantId, practitioner.id, date);
        }
        const today = new Date();
        return this.schedulingService.listAgenda(practitioner.tenantId, practitioner.id, today);
    }
    async getMyWeeklyAppointments(user, startDateString) {
        const practitioner = await this.practitionerAuthService.getPractitionerByUserId(user.id);
        const startDate = startDateString ? new Date(startDateString) : new Date();
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7);
        return this.schedulingService.getAppointmentsByDateRange(practitioner.tenantId, practitioner.id, startDate, endDate);
    }
    async getMyMonthlyAppointments(user, year, month) {
        const practitioner = await this.practitionerAuthService.getPractitionerByUserId(user.id);
        const currentDate = new Date();
        const targetYear = year || currentDate.getFullYear();
        const targetMonth = month || currentDate.getMonth() + 1;
        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 0);
        return this.schedulingService.getAppointmentsByDateRange(practitioner.tenantId, practitioner.id, startDate, endDate);
    }
    async getMyAppointment(user, appointmentId) {
        const practitioner = await this.practitionerAuthService.getPractitionerByUserId(user.id);
        const appointment = await this.schedulingService.getAppointmentById(practitioner.tenantId, appointmentId);
        if (appointment.practitionerId !== practitioner.id) {
            throw new Error('Vous n\'avez pas accès à ce rendez-vous');
        }
        return appointment;
    }
    async getMyAvailability(user, dateString) {
        const practitioner = await this.practitionerAuthService.getPractitionerByUserId(user.id);
        return this.schedulingService.getPractitionerAvailability(practitioner.tenantId, practitioner.id, dateString ? new Date(dateString) : undefined);
    }
    async getMyStats(user, startDateString, endDateString) {
        const practitioner = await this.practitionerAuthService.getPractitionerByUserId(user.id);
        const startDate = startDateString ? new Date(startDateString) : new Date();
        const endDate = endDateString ? new Date(endDateString) : new Date();
        if (!endDateString) {
            endDate.setMonth(endDate.getMonth() + 1);
            endDate.setDate(0);
        }
        const appointments = await this.schedulingService.getAppointmentsByDateRange(practitioner.tenantId, practitioner.id, startDate, endDate);
        return {
            totalAppointments: appointments.length,
            appointmentsByStatus: appointments.reduce((acc, appointment) => {
                acc[appointment.status] = (acc[appointment.status] || 0) + 1;
                return acc;
            }, {}),
            appointmentsByUrgency: appointments.reduce((acc, appointment) => {
                acc[appointment.urgency] = (acc[appointment.urgency] || 0) + 1;
                return acc;
            }, {}),
            practitioner: {
                id: practitioner.id,
                firstName: practitioner.firstName,
                lastName: practitioner.lastName,
                specialty: practitioner.specialty,
            },
        };
    }
};
exports.PractitionerScheduleController = PractitionerScheduleController;
__decorate([
    (0, common_1.Get)('appointments'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PractitionerScheduleController.prototype, "getMyAppointments", null);
__decorate([
    (0, common_1.Get)('appointments/week'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('startDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PractitionerScheduleController.prototype, "getMyWeeklyAppointments", null);
__decorate([
    (0, common_1.Get)('appointments/month'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], PractitionerScheduleController.prototype, "getMyMonthlyAppointments", null);
__decorate([
    (0, common_1.Get)('appointments/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PractitionerScheduleController.prototype, "getMyAppointment", null);
__decorate([
    (0, common_1.Get)('availability'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PractitionerScheduleController.prototype, "getMyAvailability", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PractitionerScheduleController.prototype, "getMyStats", null);
exports.PractitionerScheduleController = PractitionerScheduleController = __decorate([
    (0, common_1.Controller)('practitioner/schedule'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [scheduling_service_1.SchedulingService,
        practitioner_auth_service_1.PractitionerAuthService])
], PractitionerScheduleController);
//# sourceMappingURL=practitioner-schedule.controller.js.map