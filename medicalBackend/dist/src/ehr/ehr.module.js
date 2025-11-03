"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EhrModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const entities_1 = require("./entities");
const services_1 = require("./services");
const controllers_1 = require("./controllers");
const resolvers_1 = require("./resolvers");
const ehr_supervisor_guard_1 = require("./guards/ehr-supervisor.guard");
const common_module_1 = require("../common/common.module");
const tenant_entity_1 = require("../auth/entities/tenant.entity");
let EhrModule = class EhrModule {
};
exports.EhrModule = EhrModule;
exports.EhrModule = EhrModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([entities_1.Encounter, entities_1.Prescription, entities_1.PrescriptionItem, entities_1.LabResult, entities_1.AuditLog, tenant_entity_1.Tenant]),
            event_emitter_1.EventEmitterModule.forRoot(),
            common_module_1.CommonModule,
        ],
        controllers: [controllers_1.EncountersController, controllers_1.PrescriptionsController, controllers_1.LabResultsController],
        providers: [
            services_1.EncountersService,
            services_1.PrescriptionsService,
            services_1.LabResultsService,
            resolvers_1.EncountersResolver,
            resolvers_1.PrescriptionsResolver,
            resolvers_1.LabResultsResolver,
            ehr_supervisor_guard_1.EHRSupervisorGuard,
        ],
        exports: [services_1.EncountersService, services_1.PrescriptionsService, services_1.LabResultsService],
    })
], EhrModule);
//# sourceMappingURL=ehr.module.js.map