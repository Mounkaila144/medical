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
exports.TimesheetService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const timesheet_entity_1 = require("../entities/timesheet.entity");
const staff_service_1 = require("./staff.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let TimesheetService = class TimesheetService {
    timesheetRepository;
    staffService;
    eventEmitter;
    constructor(timesheetRepository, staffService, eventEmitter) {
        this.timesheetRepository = timesheetRepository;
        this.staffService = staffService;
        this.eventEmitter = eventEmitter;
    }
    async findAll() {
        return this.timesheetRepository.find({
            relations: ['staff'],
            order: { year: 'DESC', month: 'DESC' }
        });
    }
    async findByStaff(staffId) {
        return this.timesheetRepository.find({
            where: { staffId },
            relations: ['staff'],
            order: { year: 'DESC', month: 'DESC' }
        });
    }
    async findByPeriod(month, year) {
        return this.timesheetRepository.find({
            where: { month, year },
            relations: ['staff']
        });
    }
    async findPendingApproval() {
        return this.timesheetRepository.find({
            where: { approved: false },
            relations: ['staff'],
            order: { year: 'DESC', month: 'DESC' }
        });
    }
    async findOne(id) {
        const timesheet = await this.timesheetRepository.findOne({
            where: { id },
            relations: ['staff']
        });
        if (!timesheet) {
            throw new common_1.NotFoundException(`Timesheet with ID ${id} not found`);
        }
        return timesheet;
    }
    async create(createTimesheetInput) {
        await this.staffService.findOne(createTimesheetInput.staffId);
        const existing = await this.timesheetRepository.findOne({
            where: {
                staffId: createTimesheetInput.staffId,
                month: createTimesheetInput.month,
                year: createTimesheetInput.year
            }
        });
        if (existing) {
            throw new common_1.BadRequestException(`Timesheet already exists for ${createTimesheetInput.month}/${createTimesheetInput.year}`);
        }
        const timesheet = this.timesheetRepository.create(createTimesheetInput);
        const savedTimesheet = await this.timesheetRepository.save(timesheet);
        this.eventEmitter.emit('timesheet.created', savedTimesheet);
        return savedTimesheet;
    }
    async update(id, updateTimesheetInput) {
        const timesheet = await this.findOne(id);
        if (timesheet.approved && updateTimesheetInput.hours !== undefined) {
            throw new common_1.BadRequestException('Cannot update hours for approved timesheet');
        }
        const becomingApproved = !timesheet.approved && updateTimesheetInput.approved === true;
        Object.assign(timesheet, updateTimesheetInput);
        const savedTimesheet = await this.timesheetRepository.save(timesheet);
        if (becomingApproved) {
            this.eventEmitter.emit('timesheet.approved', savedTimesheet);
        }
        return savedTimesheet;
    }
    async remove(id) {
        const timesheet = await this.findOne(id);
        if (timesheet.approved) {
            throw new common_1.BadRequestException('Cannot delete approved timesheet');
        }
        const result = await this.timesheetRepository.delete(id);
        return !!result.affected && result.affected > 0;
    }
};
exports.TimesheetService = TimesheetService;
exports.TimesheetService = TimesheetService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(timesheet_entity_1.Timesheet)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        staff_service_1.StaffService,
        event_emitter_1.EventEmitter2])
], TimesheetService);
//# sourceMappingURL=timesheet.service.js.map