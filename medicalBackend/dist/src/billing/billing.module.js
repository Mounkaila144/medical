"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const entities_1 = require("./entities");
const services_1 = require("./services");
const controllers_1 = require("./controllers");
const resolvers_1 = require("./resolvers");
const tenant_entity_1 = require("../auth/entities/tenant.entity");
const common_module_1 = require("../common/common.module");
let BillingModule = class BillingModule {
};
exports.BillingModule = BillingModule;
exports.BillingModule = BillingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([entities_1.Tariff, entities_1.Invoice, entities_1.InvoiceLine, entities_1.Payment, entities_1.Expense, tenant_entity_1.Tenant]),
            event_emitter_1.EventEmitterModule.forRoot(),
            common_module_1.CommonModule,
        ],
        controllers: [controllers_1.InvoicesController, controllers_1.PaymentsController, controllers_1.TariffsController, controllers_1.ExpensesController],
        providers: [
            services_1.InvoicingService,
            services_1.PaymentsService,
            resolvers_1.InvoicesResolver,
            resolvers_1.PaymentsResolver,
            resolvers_1.TariffsResolver,
        ],
        exports: [services_1.InvoicingService, services_1.PaymentsService],
    })
], BillingModule);
//# sourceMappingURL=billing.module.js.map