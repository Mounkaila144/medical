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
exports.LeaveResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const leave_service_1 = require("../services/leave.service");
const leave_request_dto_1 = require("../dtos/leave-request.dto");
let LeaveResolver = class LeaveResolver {
    leaveService;
    constructor(leaveService) {
        this.leaveService = leaveService;
    }
    async leaveRequests() {
        return this.leaveService.findAll();
    }
    async leaveRequestsByStaff(staffId) {
        return this.leaveService.findByStaff(staffId);
    }
    async pendingLeaveRequests() {
        return this.leaveService.findPendingRequests();
    }
    async leaveRequest(id) {
        return this.leaveService.findOne(id);
    }
    async createLeaveRequest(createLeaveRequestInput) {
        return this.leaveService.create(createLeaveRequestInput);
    }
    async updateLeaveRequest(id, updateLeaveRequestInput) {
        return this.leaveService.update(id, updateLeaveRequestInput);
    }
    async approveLeaveRequest(approveLeaveRequestInput) {
        return this.leaveService.approveLeaveRequest(approveLeaveRequestInput);
    }
    async removeLeaveRequest(id) {
        return this.leaveService.remove(id);
    }
};
exports.LeaveResolver = LeaveResolver;
__decorate([
    (0, graphql_1.Query)(() => [leave_request_dto_1.LeaveRequestDto]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeaveResolver.prototype, "leaveRequests", null);
__decorate([
    (0, graphql_1.Query)(() => [leave_request_dto_1.LeaveRequestDto]),
    __param(0, (0, graphql_1.Args)('staffId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeaveResolver.prototype, "leaveRequestsByStaff", null);
__decorate([
    (0, graphql_1.Query)(() => [leave_request_dto_1.LeaveRequestDto]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeaveResolver.prototype, "pendingLeaveRequests", null);
__decorate([
    (0, graphql_1.Query)(() => leave_request_dto_1.LeaveRequestDto),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeaveResolver.prototype, "leaveRequest", null);
__decorate([
    (0, graphql_1.Mutation)(() => leave_request_dto_1.LeaveRequestDto),
    __param(0, (0, graphql_1.Args)('createLeaveRequestInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [leave_request_dto_1.CreateLeaveRequestInput]),
    __metadata("design:returntype", Promise)
], LeaveResolver.prototype, "createLeaveRequest", null);
__decorate([
    (0, graphql_1.Mutation)(() => leave_request_dto_1.LeaveRequestDto),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('updateLeaveRequestInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, leave_request_dto_1.UpdateLeaveRequestInput]),
    __metadata("design:returntype", Promise)
], LeaveResolver.prototype, "updateLeaveRequest", null);
__decorate([
    (0, graphql_1.Mutation)(() => leave_request_dto_1.LeaveRequestDto),
    __param(0, (0, graphql_1.Args)('approveLeaveRequestInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [leave_request_dto_1.ApproveLeaveRequestInput]),
    __metadata("design:returntype", Promise)
], LeaveResolver.prototype, "approveLeaveRequest", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeaveResolver.prototype, "removeLeaveRequest", null);
exports.LeaveResolver = LeaveResolver = __decorate([
    (0, graphql_1.Resolver)(() => leave_request_dto_1.LeaveRequestDto),
    __metadata("design:paramtypes", [leave_service_1.LeaveService])
], LeaveResolver);
//# sourceMappingURL=leave.resolver.js.map