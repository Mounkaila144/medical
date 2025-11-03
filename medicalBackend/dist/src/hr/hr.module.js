"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HrModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const staff_entity_1 = require("./entities/staff.entity");
const shift_entity_1 = require("./entities/shift.entity");
const leave_request_entity_1 = require("./entities/leave-request.entity");
const timesheet_entity_1 = require("./entities/timesheet.entity");
const payroll_export_entity_1 = require("./entities/payroll-export.entity");
const staff_service_1 = require("./services/staff.service");
const shift_service_1 = require("./services/shift.service");
const leave_service_1 = require("./services/leave.service");
const timesheet_service_1 = require("./services/timesheet.service");
const payroll_service_1 = require("./services/payroll.service");
const staff_resolver_1 = require("./resolvers/staff.resolver");
const shift_resolver_1 = require("./resolvers/shift.resolver");
const leave_resolver_1 = require("./resolvers/leave.resolver");
const timesheet_resolver_1 = require("./resolvers/timesheet.resolver");
const payroll_resolver_1 = require("./resolvers/payroll.resolver");
let HrModule = class HrModule {
};
exports.HrModule = HrModule;
exports.HrModule = HrModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                staff_entity_1.Staff,
                shift_entity_1.Shift,
                leave_request_entity_1.LeaveRequest,
                timesheet_entity_1.Timesheet,
                payroll_export_entity_1.PayrollExport,
            ]),
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
            staff_service_1.StaffService,
            shift_service_1.ShiftService,
            leave_service_1.LeaveService,
            timesheet_service_1.TimesheetService,
            payroll_service_1.PayrollService,
        ],
    })
], HrModule);
//# sourceMappingURL=hr.module.js.map