"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HrCoreModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const graphql_1 = require("@nestjs/graphql");
const apollo_1 = require("@nestjs/apollo");
const config_1 = require("@nestjs/config");
const staff_entity_1 = require("../mocks/entities/staff.entity");
const shift_entity_1 = require("../mocks/entities/shift.entity");
const leave_request_entity_1 = require("../mocks/entities/leave-request.entity");
const timesheet_entity_1 = require("../mocks/entities/timesheet.entity");
const payroll_export_entity_1 = require("../mocks/entities/payroll-export.entity");
const tenant_entity_1 = require("../mocks/entities/tenant.entity");
const staff_service_1 = require("../../../hr/services/staff.service");
const shift_service_1 = require("../../../hr/services/shift.service");
const leave_service_1 = require("../../../hr/services/leave.service");
const timesheet_service_1 = require("../../../hr/services/timesheet.service");
const payroll_service_1 = require("../../../hr/services/payroll.service");
const staff_resolver_1 = require("../../../hr/resolvers/staff.resolver");
const shift_resolver_1 = require("../../../hr/resolvers/shift.resolver");
const leave_resolver_1 = require("../../../hr/resolvers/leave.resolver");
const timesheet_resolver_1 = require("../../../hr/resolvers/timesheet.resolver");
const payroll_resolver_1 = require("../../../hr/resolvers/payroll.resolver");
let HrCoreModule = class HrCoreModule {
};
exports.HrCoreModule = HrCoreModule;
exports.HrCoreModule = HrCoreModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'sqlite',
                database: ':memory:',
                entities: [
                    staff_entity_1.Staff,
                    shift_entity_1.Shift,
                    leave_request_entity_1.LeaveRequest,
                    timesheet_entity_1.Timesheet,
                    payroll_export_entity_1.PayrollExport,
                    tenant_entity_1.Tenant
                ],
                synchronize: true,
                logging: false,
            }),
            typeorm_1.TypeOrmModule.forFeature([
                staff_entity_1.Staff,
                shift_entity_1.Shift,
                leave_request_entity_1.LeaveRequest,
                timesheet_entity_1.Timesheet,
                payroll_export_entity_1.PayrollExport,
                tenant_entity_1.Tenant
            ]),
            event_emitter_1.EventEmitterModule.forRoot(),
            graphql_1.GraphQLModule.forRoot({
                driver: apollo_1.ApolloDriver,
                autoSchemaFile: true,
                playground: true,
            }),
        ],
        providers: [
            staff_service_1.StaffService,
            shift_service_1.ShiftService,
            leave_service_1.LeaveService,
            timesheet_service_1.TimesheetService,
            payroll_service_1.PayrollService,
            staff_resolver_1.StaffResolver,
            shift_resolver_1.ShiftResolver,
            leave_resolver_1.LeaveResolver,
            timesheet_resolver_1.TimesheetResolver,
            payroll_resolver_1.PayrollResolver,
        ],
        exports: [
            typeorm_1.TypeOrmModule,
            staff_service_1.StaffService,
            shift_service_1.ShiftService,
            leave_service_1.LeaveService,
            timesheet_service_1.TimesheetService,
            payroll_service_1.PayrollService
        ]
    })
], HrCoreModule);
//# sourceMappingURL=hr-core.module.js.map