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
exports.AgendaResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const scheduling_service_1 = require("../services/scheduling.service");
const agenda_dto_1 = require("../dto/agenda.dto");
const tenant_id_decorator_1 = require("../../common/decorators/tenant-id.decorator");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const gql_auth_guard_1 = require("../../auth/guards/gql-auth.guard");
const tenant_guard_1 = require("../../common/guards/tenant.guard");
let AgendaResolver = class AgendaResolver {
    schedulingService;
    constructor(schedulingService) {
        this.schedulingService = schedulingService;
    }
    async agenda(tenantId, practitionerId, dateString) {
        const date = new Date(dateString);
        const appointments = await this.schedulingService.listAgenda(tenantId, practitionerId, date);
        return {
            date: dateString,
            appointments,
        };
    }
};
exports.AgendaResolver = AgendaResolver;
__decorate([
    (0, graphql_1.Query)(() => agenda_dto_1.AgendaDto),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('practitionerId')),
    __param(2, (0, graphql_1.Args)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AgendaResolver.prototype, "agenda", null);
exports.AgendaResolver = AgendaResolver = __decorate([
    (0, graphql_1.Resolver)(() => agenda_dto_1.AgendaDto),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, gql_auth_guard_1.GqlAuthGuard, tenant_guard_1.TenantGuard),
    __metadata("design:paramtypes", [scheduling_service_1.SchedulingService])
], AgendaResolver);
//# sourceMappingURL=agenda.resolver.js.map