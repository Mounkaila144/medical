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
exports.ShiftResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const shift_service_1 = require("../services/shift.service");
const shift_dto_1 = require("../dtos/shift.dto");
let ShiftResolver = class ShiftResolver {
    shiftService;
    constructor(shiftService) {
        this.shiftService = shiftService;
    }
    async shifts() {
        return this.shiftService.findAll();
    }
    async shiftsByStaff(staffId) {
        return this.shiftService.findByStaff(staffId);
    }
    async shiftsByDateRange(start, end) {
        return this.shiftService.findByDateRange(start, end);
    }
    async shift(id) {
        return this.shiftService.findOne(id);
    }
    async createShift(createShiftInput) {
        return this.shiftService.create(createShiftInput);
    }
    async updateShift(id, updateShiftInput) {
        return this.shiftService.update(id, updateShiftInput);
    }
    async removeShift(id) {
        return this.shiftService.remove(id);
    }
};
exports.ShiftResolver = ShiftResolver;
__decorate([
    (0, graphql_1.Query)(() => [shift_dto_1.ShiftDto]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShiftResolver.prototype, "shifts", null);
__decorate([
    (0, graphql_1.Query)(() => [shift_dto_1.ShiftDto]),
    __param(0, (0, graphql_1.Args)('staffId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShiftResolver.prototype, "shiftsByStaff", null);
__decorate([
    (0, graphql_1.Query)(() => [shift_dto_1.ShiftDto]),
    __param(0, (0, graphql_1.Args)('start')),
    __param(1, (0, graphql_1.Args)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Date,
        Date]),
    __metadata("design:returntype", Promise)
], ShiftResolver.prototype, "shiftsByDateRange", null);
__decorate([
    (0, graphql_1.Query)(() => shift_dto_1.ShiftDto),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShiftResolver.prototype, "shift", null);
__decorate([
    (0, graphql_1.Mutation)(() => shift_dto_1.ShiftDto),
    __param(0, (0, graphql_1.Args)('createShiftInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [shift_dto_1.CreateShiftInput]),
    __metadata("design:returntype", Promise)
], ShiftResolver.prototype, "createShift", null);
__decorate([
    (0, graphql_1.Mutation)(() => shift_dto_1.ShiftDto),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('updateShiftInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, shift_dto_1.UpdateShiftInput]),
    __metadata("design:returntype", Promise)
], ShiftResolver.prototype, "updateShift", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShiftResolver.prototype, "removeShift", null);
exports.ShiftResolver = ShiftResolver = __decorate([
    (0, graphql_1.Resolver)(() => shift_dto_1.ShiftDto),
    __metadata("design:paramtypes", [shift_service_1.ShiftService])
], ShiftResolver);
//# sourceMappingURL=shift.resolver.js.map