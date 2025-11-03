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
exports.EncountersResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const encounters_service_1 = require("../services/encounters.service");
const encounter_entity_1 = require("../entities/encounter.entity");
const create_encounter_dto_1 = require("../dto/create-encounter.dto");
const update_encounter_dto_1 = require("../dto/update-encounter.dto");
const lock_encounter_dto_1 = require("../dto/lock-encounter.dto");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../common/guards/gql-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../../auth/entities/user.entity");
const ehr_supervisor_guard_1 = require("../guards/ehr-supervisor.guard");
let EncountersResolver = class EncountersResolver {
    encountersService;
    constructor(encountersService) {
        this.encountersService = encountersService;
    }
    async createEncounter(createEncounterDto, context) {
        return this.encountersService.create(context.req.user.tenantId, createEncounterDto);
    }
    async encounters(context) {
        return this.encountersService.findAll(context.req.user.tenantId);
    }
    async encounter(id) {
        return this.encountersService.findOne(id);
    }
    async updateEncounter(updateEncounterDto, context) {
        return this.encountersService.update(context.req.user.tenantId, updateEncounterDto);
    }
    async lockEncounter(lockEncounterDto, context) {
        return this.encountersService.lock(context.req.user.tenantId, lockEncounterDto);
    }
};
exports.EncountersResolver = EncountersResolver;
__decorate([
    (0, graphql_1.Mutation)(() => encounter_entity_1.Encounter),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, graphql_1.Args)('createEncounterDto')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_encounter_dto_1.CreateEncounterDto, Object]),
    __metadata("design:returntype", Promise)
], EncountersResolver.prototype, "createEncounter", null);
__decorate([
    (0, graphql_1.Query)(() => [encounter_entity_1.Encounter]),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EncountersResolver.prototype, "encounters", null);
__decorate([
    (0, graphql_1.Query)(() => encounter_entity_1.Encounter),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EncountersResolver.prototype, "encounter", null);
__decorate([
    (0, graphql_1.Mutation)(() => encounter_entity_1.Encounter),
    (0, common_1.UseGuards)(ehr_supervisor_guard_1.EHRSupervisorGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, graphql_1.Args)('updateEncounterDto')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_encounter_dto_1.UpdateEncounterDto, Object]),
    __metadata("design:returntype", Promise)
], EncountersResolver.prototype, "updateEncounter", null);
__decorate([
    (0, graphql_1.Mutation)(() => encounter_entity_1.Encounter),
    (0, roles_decorator_1.Roles)(user_entity_1.AuthUserRole.CLINIC_ADMIN, user_entity_1.AuthUserRole.EMPLOYEE),
    __param(0, (0, graphql_1.Args)('lockEncounterDto')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lock_encounter_dto_1.LockEncounterDto, Object]),
    __metadata("design:returntype", Promise)
], EncountersResolver.prototype, "lockEncounter", null);
exports.EncountersResolver = EncountersResolver = __decorate([
    (0, graphql_1.Resolver)(() => encounter_entity_1.Encounter),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [encounters_service_1.EncountersService])
], EncountersResolver);
//# sourceMappingURL=encounters.resolver.js.map