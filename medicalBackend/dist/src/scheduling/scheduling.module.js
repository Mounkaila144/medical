"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const event_emitter_1 = require("@nestjs/event-emitter");
const practitioner_entity_1 = require("./entities/practitioner.entity");
const availability_entity_1 = require("./entities/availability.entity");
const appointment_entity_1 = require("./entities/appointment.entity");
const wait_queue_entry_entity_1 = require("./entities/wait-queue-entry.entity");
const scheduling_service_1 = require("./services/scheduling.service");
const wait_queue_service_1 = require("./services/wait-queue.service");
const practitioners_service_1 = require("./services/practitioners.service");
const appointments_controller_1 = require("./controllers/appointments.controller");
const wait_queue_controller_1 = require("./controllers/wait-queue.controller");
const public_wait_queue_controller_1 = require("./controllers/public-wait-queue.controller");
const wait_queue_test_controller_1 = require("./controllers/wait-queue-test.controller");
const test_simple_controller_1 = require("./controllers/test-simple.controller");
const practitioners_controller_1 = require("./controllers/practitioners.controller");
const practitioner_schedule_controller_1 = require("./controllers/practitioner-schedule.controller");
const agenda_resolver_1 = require("./resolvers/agenda.resolver");
const queue_gateway_1 = require("./gateways/queue.gateway");
const auth_module_1 = require("../auth/auth.module");
let SchedulingModule = class SchedulingModule {
};
exports.SchedulingModule = SchedulingModule;
exports.SchedulingModule = SchedulingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                practitioner_entity_1.Practitioner,
                availability_entity_1.Availability,
                appointment_entity_1.Appointment,
                wait_queue_entry_entity_1.WaitQueueEntry,
            ]),
            schedule_1.ScheduleModule.forRoot(),
            event_emitter_1.EventEmitterModule.forRoot(),
            auth_module_1.AuthModule,
        ],
        providers: [
            scheduling_service_1.SchedulingService,
            wait_queue_service_1.WaitQueueService,
            practitioners_service_1.PractitionersService,
            agenda_resolver_1.AgendaResolver,
            queue_gateway_1.QueueGateway,
        ],
        controllers: [
            appointments_controller_1.AppointmentsController,
            wait_queue_controller_1.WaitQueueController,
            public_wait_queue_controller_1.PublicWaitQueueController,
            wait_queue_test_controller_1.WaitQueueTestController,
            test_simple_controller_1.TestSimpleController,
            practitioners_controller_1.PractitionersController,
            practitioner_schedule_controller_1.PractitionerScheduleController,
        ],
        exports: [
            scheduling_service_1.SchedulingService,
            wait_queue_service_1.WaitQueueService,
            practitioners_service_1.PractitionersService,
        ],
    })
], SchedulingModule);
//# sourceMappingURL=scheduling.module.js.map