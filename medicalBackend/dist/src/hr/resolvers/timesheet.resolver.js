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
exports.TimesheetResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const timesheet_service_1 = require("../services/timesheet.service");
const timesheet_dto_1 = require("../dtos/timesheet.dto");
let TimesheetResolver = class TimesheetResolver {
    timesheetService;
    constructor(timesheetService) {
        this.timesheetService = timesheetService;
    }
    async timesheets() {
        return this.timesheetService.findAll();
    }
    async timesheetsByStaff(staffId) {
        return this.timesheetService.findByStaff(staffId);
    }
    async timesheetsByPeriod(month, year) {
        return this.timesheetService.findByPeriod(month, year);
    }
    async pendingTimesheets() {
        return this.timesheetService.findPendingApproval();
    }
    async timesheet(id) {
        return this.timesheetService.findOne(id);
    }
    async createTimesheet(createTimesheetInput) {
        return this.timesheetService.create(createTimesheetInput);
    }
    async updateTimesheet(id, updateTimesheetInput) {
        return this.timesheetService.update(id, updateTimesheetInput);
    }
    async approveTimesheet(id) {
        return this.timesheetService.update(id, { approved: true });
    }
    async removeTimesheet(id) {
        return this.timesheetService.remove(id);
    }
};
exports.TimesheetResolver = TimesheetResolver;
__decorate([
    (0, graphql_1.Query)(() => [timesheet_dto_1.TimesheetDto]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TimesheetResolver.prototype, "timesheets", null);
__decorate([
    (0, graphql_1.Query)(() => [timesheet_dto_1.TimesheetDto]),
    __param(0, (0, graphql_1.Args)('staffId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TimesheetResolver.prototype, "timesheetsByStaff", null);
__decorate([
    (0, graphql_1.Query)(() => [timesheet_dto_1.TimesheetDto]),
    __param(0, (0, graphql_1.Args)('month')),
    __param(1, (0, graphql_1.Args)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], TimesheetResolver.prototype, "timesheetsByPeriod", null);
__decorate([
    (0, graphql_1.Query)(() => [timesheet_dto_1.TimesheetDto]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TimesheetResolver.prototype, "pendingTimesheets", null);
__decorate([
    (0, graphql_1.Query)(() => timesheet_dto_1.TimesheetDto),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TimesheetResolver.prototype, "timesheet", null);
__decorate([
    (0, graphql_1.Mutation)(() => timesheet_dto_1.TimesheetDto),
    __param(0, (0, graphql_1.Args)('createTimesheetInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [timesheet_dto_1.CreateTimesheetInput]),
    __metadata("design:returntype", Promise)
], TimesheetResolver.prototype, "createTimesheet", null);
__decorate([
    (0, graphql_1.Mutation)(() => timesheet_dto_1.TimesheetDto),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('updateTimesheetInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, timesheet_dto_1.UpdateTimesheetInput]),
    __metadata("design:returntype", Promise)
], TimesheetResolver.prototype, "updateTimesheet", null);
__decorate([
    (0, graphql_1.Mutation)(() => timesheet_dto_1.TimesheetDto),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TimesheetResolver.prototype, "approveTimesheet", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TimesheetResolver.prototype, "removeTimesheet", null);
exports.TimesheetResolver = TimesheetResolver = __decorate([
    (0, graphql_1.Resolver)(() => timesheet_dto_1.TimesheetDto),
    __metadata("design:paramtypes", [timesheet_service_1.TimesheetService])
], TimesheetResolver);
//# sourceMappingURL=timesheet.resolver.js.map