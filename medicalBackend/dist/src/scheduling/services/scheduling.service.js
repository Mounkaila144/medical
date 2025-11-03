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
exports.SchedulingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const appointment_entity_1 = require("../entities/appointment.entity");
const practitioner_entity_1 = require("../entities/practitioner.entity");
const appointment_status_enum_1 = require("../enums/appointment-status.enum");
const appointment_created_event_1 = require("../events/appointment-created.event");
const appointment_cancelled_event_1 = require("../events/appointment-cancelled.event");
let SchedulingService = class SchedulingService {
    appointmentRepository;
    practitionerRepository;
    eventEmitter;
    constructor(appointmentRepository, practitionerRepository, eventEmitter) {
        this.appointmentRepository = appointmentRepository;
        this.practitionerRepository = practitionerRepository;
        this.eventEmitter = eventEmitter;
    }
    async book(tenantId, createAppointmentDto) {
        const practitioner = await this.practitionerRepository.findOne({
            where: { id: createAppointmentDto.practitionerId },
        });
        if (!practitioner) {
            throw new common_1.HttpException(`Praticien avec l'ID ${createAppointmentDto.practitionerId} non trouvé`, common_1.HttpStatus.NOT_FOUND);
        }
        const isAvailable = await this.checkAvailability(createAppointmentDto.practitionerId, createAppointmentDto.startAt, createAppointmentDto.endAt);
        if (!isAvailable) {
            throw new common_1.HttpException(`Le praticien ${practitioner.firstName} ${practitioner.lastName} n'est pas disponible sur ce créneau`, common_1.HttpStatus.CONFLICT);
        }
        console.log('Practitioner found and available, creating appointment...');
        const appointment = this.appointmentRepository.create({
            tenantId,
            ...createAppointmentDto,
            status: appointment_status_enum_1.AppointmentStatus.BOOKED,
        });
        const savedAppointment = await this.appointmentRepository.save(appointment);
        this.eventEmitter.emit('appointment.created', new appointment_created_event_1.AppointmentCreatedEvent(savedAppointment));
        return savedAppointment;
    }
    async reschedule(tenantId, rescheduleDto) {
        const appointment = await this.appointmentRepository.findOne({
            where: { id: rescheduleDto.appointmentId, tenantId },
        });
        if (!appointment) {
            throw new common_1.NotFoundException('Rendez-vous non trouvé');
        }
        const practitionerId = rescheduleDto.practitionerId || appointment.practitionerId;
        const conflictingAppointments = await this.getConflictingAppointments(practitionerId, rescheduleDto.startAt, rescheduleDto.endAt, appointment.id);
        if (conflictingAppointments.length > 0) {
            throw new common_1.ConflictException('Le praticien n\'est pas disponible sur ce créneau');
        }
        appointment.startAt = rescheduleDto.startAt;
        appointment.endAt = rescheduleDto.endAt;
        if (rescheduleDto.practitionerId) {
            appointment.practitionerId = rescheduleDto.practitionerId;
        }
        if (rescheduleDto.room) {
            appointment.room = rescheduleDto.room;
        }
        return this.appointmentRepository.save(appointment);
    }
    async cancel(tenantId, appointmentId, cancelDto) {
        const appointment = await this.appointmentRepository.findOne({
            where: { id: appointmentId, tenantId },
        });
        if (!appointment) {
            throw new common_1.NotFoundException('Rendez-vous non trouvé');
        }
        appointment.status = appointment_status_enum_1.AppointmentStatus.CANCELLED;
        if (cancelDto?.cancellationReason) {
            appointment.reason = `Annulé: ${cancelDto.cancellationReason}`;
        }
        const updatedAppointment = await this.appointmentRepository.save(appointment);
        this.eventEmitter.emit('appointment.cancelled', new appointment_cancelled_event_1.AppointmentCancelledEvent(updatedAppointment, cancelDto?.notifyPatient ?? true));
        return updatedAppointment;
    }
    async listAgenda(tenantId, practitionerId, date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        return this.appointmentRepository.find({
            where: {
                tenantId,
                practitionerId,
                startAt: (0, typeorm_2.MoreThan)(startOfDay),
                endAt: (0, typeorm_2.LessThan)(endOfDay),
                status: (0, typeorm_2.Not)(appointment_status_enum_1.AppointmentStatus.CANCELLED),
            },
            order: { startAt: 'ASC' },
        });
    }
    async getAllAppointments(tenantId, dateString) {
        const whereCondition = { tenantId };
        if (dateString) {
            const date = new Date(dateString);
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            whereCondition.startAt = (0, typeorm_2.MoreThan)(startOfDay);
            whereCondition.endAt = (0, typeorm_2.LessThan)(endOfDay);
        }
        return this.appointmentRepository.find({
            where: whereCondition,
            order: { startAt: 'ASC' },
            relations: ['practitioner'],
        });
    }
    async getAppointmentById(tenantId, appointmentId) {
        const appointment = await this.appointmentRepository.findOne({
            where: { id: appointmentId, tenantId },
            relations: ['practitioner'],
        });
        if (!appointment) {
            throw new common_1.NotFoundException('Rendez-vous non trouvé');
        }
        return appointment;
    }
    async updateAppointment(tenantId, appointmentId, updateData) {
        const appointment = await this.appointmentRepository.findOne({
            where: { id: appointmentId, tenantId },
        });
        if (!appointment) {
            throw new common_1.NotFoundException('Rendez-vous non trouvé');
        }
        if (updateData.startAt || updateData.endAt || updateData.practitionerId) {
            const startAt = updateData.startAt || appointment.startAt;
            const endAt = updateData.endAt || appointment.endAt;
            const practitionerId = updateData.practitionerId || appointment.practitionerId;
            const conflictingAppointments = await this.getConflictingAppointments(practitionerId, startAt, endAt, appointmentId);
            if (conflictingAppointments.length > 0) {
                throw new common_1.ConflictException('Le praticien n\'est pas disponible sur ce créneau');
            }
        }
        Object.assign(appointment, updateData);
        return this.appointmentRepository.save(appointment);
    }
    async getConflictingAppointments(practitionerId, start, end, excludeAppointmentId) {
        try {
            const whereCondition = {
                practitionerId,
                status: (0, typeorm_2.Not)(appointment_status_enum_1.AppointmentStatus.CANCELLED),
            };
            if (excludeAppointmentId) {
                whereCondition.id = (0, typeorm_2.Not)(excludeAppointmentId);
            }
            const allAppointments = await this.appointmentRepository.find({
                where: whereCondition,
            });
            const conflictingAppointments = allAppointments.filter(appointment => {
                const appointmentStart = new Date(appointment.startAt);
                const appointmentEnd = new Date(appointment.endAt);
                return (appointmentStart < end) && (start < appointmentEnd);
            });
            console.log(`Found ${conflictingAppointments.length} conflicting appointments`);
            return conflictingAppointments;
        }
        catch (error) {
            console.error('Error in getConflictingAppointments:', error);
            console.error('Error stack:', error.stack);
            throw new common_1.BadRequestException('Erreur lors de la vérification de disponibilité');
        }
    }
    async checkAvailability(practitionerId, start, end, excludeAppointmentId) {
        const conflictingAppointments = await this.getConflictingAppointments(practitionerId, start, end, excludeAppointmentId);
        return conflictingAppointments.length === 0;
    }
    async sendDailyReminders() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const startOfDay = new Date(tomorrow);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(tomorrow);
        endOfDay.setHours(23, 59, 59, 999);
        const appointments = await this.appointmentRepository.find({
            where: {
                startAt: (0, typeorm_2.Between)(startOfDay, endOfDay),
                status: appointment_status_enum_1.AppointmentStatus.BOOKED,
            },
            relations: ['practitioner'],
        });
        for (const appointment of appointments) {
            this.eventEmitter.emit('appointment.reminder.24h', { appointment });
        }
    }
    async sendHourlyReminders() {
        const oneHourLater = new Date();
        oneHourLater.setHours(oneHourLater.getHours() + 1);
        const start = new Date(oneHourLater);
        start.setMinutes(0, 0, 0);
        const end = new Date(oneHourLater);
        end.setMinutes(59, 59, 999);
        const appointments = await this.appointmentRepository.find({
            where: {
                startAt: (0, typeorm_2.Between)(start, end),
                status: appointment_status_enum_1.AppointmentStatus.BOOKED,
            },
            relations: ['practitioner'],
        });
        for (const appointment of appointments) {
            this.eventEmitter.emit('appointment.reminder.1h', { appointment });
        }
    }
    async getAppointmentsByDateRange(tenantId, practitionerId, startDate, endDate) {
        return this.appointmentRepository.find({
            where: {
                tenantId,
                practitionerId,
                startAt: (0, typeorm_2.Between)(startDate, endDate),
                status: (0, typeorm_2.Not)(appointment_status_enum_1.AppointmentStatus.CANCELLED),
            },
            order: { startAt: 'ASC' },
            relations: ['practitioner'],
        });
    }
    async getPractitionerAvailability(tenantId, practitionerId, date) {
        const targetDate = date || new Date();
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(8, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(18, 0, 0, 0);
        const existingAppointments = await this.appointmentRepository.find({
            where: {
                tenantId,
                practitionerId,
                startAt: (0, typeorm_2.Between)(startOfDay, endOfDay),
                status: (0, typeorm_2.Not)(appointment_status_enum_1.AppointmentStatus.CANCELLED),
            },
            order: { startAt: 'ASC' },
        });
        const availableSlots = [];
        const slotDuration = 30;
        for (let hour = 8; hour < 18; hour++) {
            for (let minute = 0; minute < 60; minute += slotDuration) {
                const slotStart = new Date(targetDate);
                slotStart.setHours(hour, minute, 0, 0);
                const slotEnd = new Date(slotStart);
                slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);
                const isOccupied = existingAppointments.some(appointment => (appointment.startAt <= slotStart && appointment.endAt > slotStart) ||
                    (appointment.startAt < slotEnd && appointment.endAt >= slotEnd) ||
                    (appointment.startAt >= slotStart && appointment.endAt <= slotEnd));
                if (!isOccupied) {
                    availableSlots.push({
                        startAt: slotStart,
                        endAt: slotEnd,
                        duration: slotDuration,
                        available: true,
                    });
                }
            }
        }
        return availableSlots;
    }
};
exports.SchedulingService = SchedulingService;
__decorate([
    (0, schedule_1.Cron)('0 0 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulingService.prototype, "sendDailyReminders", null);
__decorate([
    (0, schedule_1.Cron)('0 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulingService.prototype, "sendHourlyReminders", null);
exports.SchedulingService = SchedulingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __param(1, (0, typeorm_1.InjectRepository)(practitioner_entity_1.Practitioner)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], SchedulingService);
//# sourceMappingURL=scheduling.service.js.map