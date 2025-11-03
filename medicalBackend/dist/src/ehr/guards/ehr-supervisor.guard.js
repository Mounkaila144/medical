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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EHRSupervisorGuard = void 0;
const common_1 = require("@nestjs/common");
const encounters_service_1 = require("../services/encounters.service");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const graphql_1 = require("@nestjs/graphql");
let EHRSupervisorGuard = class EHRSupervisorGuard {
    encountersService;
    constructor(encountersService) {
        this.encountersService = encountersService;
    }
    async canActivate(context) {
        try {
            let request;
            let user;
            let encounterId;
            try {
                request = context.switchToHttp().getRequest();
                if (request && request.user) {
                    user = request.user;
                    const body = request.body || {};
                    encounterId = body.id || body.encounterId;
                }
            }
            catch (e) {
            }
            if (!user) {
                try {
                    const gqlContext = graphql_1.GqlExecutionContext.create(context);
                    const ctx = gqlContext.getContext();
                    request = ctx.req;
                    if (request && request.user) {
                        user = request.user;
                        const args = gqlContext.getArgs();
                        encounterId = args.id || args.encounterId || (args.updateEncounterDto && args.updateEncounterDto.id);
                    }
                }
                catch (e) {
                }
            }
            if (!user) {
                return true;
            }
            if (user.roles?.includes(user_role_enum_1.UserRole.SUPERVISOR)) {
                return true;
            }
            if (!encounterId) {
                return true;
            }
            const encounter = await this.encountersService.findOne(encounterId);
            if (encounter?.locked) {
                throw new common_1.ForbiddenException("La consultation est verrouillée et ne peut être modifiée que par un superviseur");
            }
            return true;
        }
        catch (error) {
            console.error('Erreur dans EHRSupervisorGuard:', error);
            return true;
        }
    }
};
exports.EHRSupervisorGuard = EHRSupervisorGuard;
exports.EHRSupervisorGuard = EHRSupervisorGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [encounters_service_1.EncountersService])
], EHRSupervisorGuard);
//# sourceMappingURL=ehr-supervisor.guard.js.map