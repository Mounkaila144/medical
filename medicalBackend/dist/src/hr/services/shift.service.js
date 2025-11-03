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
exports.ShiftService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const shift_entity_1 = require("../entities/shift.entity");
const staff_service_1 = require("./staff.service");
let ShiftService = class ShiftService {
    shiftRepository;
    staffService;
    constructor(shiftRepository, staffService) {
        this.shiftRepository = shiftRepository;
        this.staffService = staffService;
    }
    async findAll() {
        return this.shiftRepository.find({ relations: ['staff'] });
    }
    async findByStaff(staffId) {
        return this.shiftRepository.find({
            where: { staffId },
            relations: ['staff'],
            order: { startAt: 'ASC' }
        });
    }
    async findByDateRange(start, end) {
        return this.shiftRepository.find({
            where: [
                { startAt: (0, typeorm_2.Between)(start, end) },
                { endAt: (0, typeorm_2.Between)(start, end) }
            ],
            relations: ['staff'],
            order: { startAt: 'ASC' }
        });
    }
    async findOne(id) {
        const shift = await this.shiftRepository.findOne({
            where: { id },
            relations: ['staff']
        });
        if (!shift) {
            throw new common_1.NotFoundException(`Shift with ID ${id} not found`);
        }
        return shift;
    }
    async create(createShiftInput) {
        await this.staffService.findOne(createShiftInput.staffId);
        const shift = this.shiftRepository.create(createShiftInput);
        return this.shiftRepository.save(shift);
    }
    async update(id, updateShiftInput) {
        const shift = await this.findOne(id);
        Object.assign(shift, updateShiftInput);
        return this.shiftRepository.save(shift);
    }
    async remove(id) {
        const result = await this.shiftRepository.delete(id);
        return !!result.affected && result.affected > 0;
    }
};
exports.ShiftService = ShiftService;
exports.ShiftService = ShiftService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(shift_entity_1.Shift)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        staff_service_1.StaffService])
], ShiftService);
//# sourceMappingURL=shift.service.js.map