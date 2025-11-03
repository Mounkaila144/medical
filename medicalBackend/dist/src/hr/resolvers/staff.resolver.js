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
exports.StaffResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const staff_service_1 = require("../services/staff.service");
const staff_dto_1 = require("../dtos/staff.dto");
let StaffResolver = class StaffResolver {
    staffService;
    constructor(staffService) {
        this.staffService = staffService;
    }
    async staff() {
        return this.staffService.findAll();
    }
    async staffByTenant(tenantId) {
        return this.staffService.findAllByTenant(tenantId);
    }
    async staffMember(id) {
        return this.staffService.findOne(id);
    }
    async createStaff(createStaffInput) {
        return this.staffService.create(createStaffInput);
    }
    async updateStaff(id, updateStaffInput) {
        return this.staffService.update(id, updateStaffInput);
    }
    async removeStaff(id) {
        return this.staffService.remove(id);
    }
};
exports.StaffResolver = StaffResolver;
__decorate([
    (0, graphql_1.Query)(() => [staff_dto_1.StaffDto]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StaffResolver.prototype, "staff", null);
__decorate([
    (0, graphql_1.Query)(() => [staff_dto_1.StaffDto]),
    __param(0, (0, graphql_1.Args)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StaffResolver.prototype, "staffByTenant", null);
__decorate([
    (0, graphql_1.Query)(() => staff_dto_1.StaffDto),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StaffResolver.prototype, "staffMember", null);
__decorate([
    (0, graphql_1.Mutation)(() => staff_dto_1.StaffDto),
    __param(0, (0, graphql_1.Args)('createStaffInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [staff_dto_1.CreateStaffInput]),
    __metadata("design:returntype", Promise)
], StaffResolver.prototype, "createStaff", null);
__decorate([
    (0, graphql_1.Mutation)(() => staff_dto_1.StaffDto),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('updateStaffInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, staff_dto_1.UpdateStaffInput]),
    __metadata("design:returntype", Promise)
], StaffResolver.prototype, "updateStaff", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StaffResolver.prototype, "removeStaff", null);
exports.StaffResolver = StaffResolver = __decorate([
    (0, graphql_1.Resolver)(() => staff_dto_1.StaffDto),
    __metadata("design:paramtypes", [staff_service_1.StaffService])
], StaffResolver);
//# sourceMappingURL=staff.resolver.js.map