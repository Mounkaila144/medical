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
exports.LeaveService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const leave_request_entity_1 = require("../entities/leave-request.entity");
const staff_service_1 = require("./staff.service");
const leave_status_enum_1 = require("../enums/leave-status.enum");
const event_emitter_1 = require("@nestjs/event-emitter");
let LeaveService = class LeaveService {
    leaveRequestRepository;
    staffService;
    eventEmitter;
    constructor(leaveRequestRepository, staffService, eventEmitter) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.staffService = staffService;
        this.eventEmitter = eventEmitter;
    }
    async findAll() {
        return this.leaveRequestRepository.find({
            relations: ['staff'],
            order: { createdAt: 'DESC' }
        });
    }
    async findByStaff(staffId) {
        return this.leaveRequestRepository.find({
            where: { staffId },
            relations: ['staff'],
            order: { start: 'ASC' }
        });
    }
    async findPendingRequests() {
        return this.leaveRequestRepository.find({
            where: { status: leave_status_enum_1.LeaveStatus.PENDING },
            relations: ['staff'],
            order: { createdAt: 'ASC' }
        });
    }
    async findOne(id) {
        const leaveRequest = await this.leaveRequestRepository.findOne({
            where: { id },
            relations: ['staff']
        });
        if (!leaveRequest) {
            throw new common_1.NotFoundException(`Leave request with ID ${id} not found`);
        }
        return leaveRequest;
    }
    async create(createLeaveRequestInput) {
        await this.staffService.findOne(createLeaveRequestInput.staffId);
        if (createLeaveRequestInput.start > createLeaveRequestInput.end) {
            throw new common_1.BadRequestException('Start date must be before end date');
        }
        const leaveRequest = this.leaveRequestRepository.create({
            ...createLeaveRequestInput,
            status: leave_status_enum_1.LeaveStatus.PENDING
        });
        const savedRequest = await this.leaveRequestRepository.save(leaveRequest);
        this.eventEmitter.emit('leave.requested', savedRequest);
        return savedRequest;
    }
    async update(id, updateLeaveRequestInput) {
        const leaveRequest = await this.findOne(id);
        if (leaveRequest.status !== leave_status_enum_1.LeaveStatus.PENDING) {
            throw new common_1.BadRequestException(`Cannot update leave request with status ${leaveRequest.status}`);
        }
        Object.assign(leaveRequest, updateLeaveRequestInput);
        return this.leaveRequestRepository.save(leaveRequest);
    }
    async approveLeaveRequest(approveInput) {
        const leaveRequest = await this.findOne(approveInput.id);
        if (leaveRequest.status !== leave_status_enum_1.LeaveStatus.PENDING) {
            throw new common_1.BadRequestException(`Cannot approve/reject leave request with status ${leaveRequest.status}`);
        }
        leaveRequest.status = approveInput.status;
        if (approveInput.comment) {
            leaveRequest.comment = approveInput.comment;
        }
        const savedRequest = await this.leaveRequestRepository.save(leaveRequest);
        if (approveInput.status === leave_status_enum_1.LeaveStatus.APPROVED) {
            this.eventEmitter.emit('leave.approved', savedRequest);
        }
        else if (approveInput.status === leave_status_enum_1.LeaveStatus.REJECTED) {
            this.eventEmitter.emit('leave.rejected', savedRequest);
        }
        return savedRequest;
    }
    async remove(id) {
        const leaveRequest = await this.findOne(id);
        if (leaveRequest.status !== leave_status_enum_1.LeaveStatus.PENDING) {
            throw new common_1.BadRequestException(`Cannot delete leave request with status ${leaveRequest.status}`);
        }
        const result = await this.leaveRequestRepository.delete(id);
        return !!result.affected && result.affected > 0;
    }
};
exports.LeaveService = LeaveService;
exports.LeaveService = LeaveService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(leave_request_entity_1.LeaveRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        staff_service_1.StaffService,
        event_emitter_1.EventEmitter2])
], LeaveService);
//# sourceMappingURL=leave.service.js.map