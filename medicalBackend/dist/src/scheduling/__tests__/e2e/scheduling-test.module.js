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
exports.SchedulingTestModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const jwt_1 = require("@nestjs/jwt");
const core_1 = require("@nestjs/core");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const passport_2 = require("@nestjs/passport");
const common_2 = require("@nestjs/common");
const practitioner_entity_1 = require("./mocks/entities/practitioner.entity");
const availability_entity_1 = require("./mocks/entities/availability.entity");
const appointment_entity_1 = require("./mocks/entities/appointment.entity");
const wait_queue_entry_entity_1 = require("./mocks/entities/wait-queue-entry.entity");
const scheduling_service_1 = require("../../services/scheduling.service");
const wait_queue_service_1 = require("../../services/wait-queue.service");
const appointments_controller_1 = require("../../controllers/appointments.controller");
const wait_queue_controller_1 = require("../../controllers/wait-queue.controller");
const agenda_resolver_1 = require("../../resolvers/agenda.resolver");
let MockJwtStrategy = class MockJwtStrategy extends (0, passport_2.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor() {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: true,
            secretOrKey: 'test-secret-key',
        });
    }
    async validate(payload) {
        return {
            userId: payload.id,
            email: payload.email,
            tenantId: payload.tenantId,
            roles: payload.roles
        };
    }
};
MockJwtStrategy = __decorate([
    (0, common_2.Injectable)(),
    __metadata("design:paramtypes", [])
], MockJwtStrategy);
class MockJwtAuthGuard {
    canActivate() {
        return true;
    }
}
class MockGqlAuthGuard {
    canActivate() {
        return true;
    }
}
class MockTenantGuard {
    canActivate() {
        return true;
    }
}
let SchedulingTestModule = class SchedulingTestModule {
};
exports.SchedulingTestModule = SchedulingTestModule;
exports.SchedulingTestModule = SchedulingTestModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'sqlite',
                    database: ':memory:',
                    entities: [practitioner_entity_1.Practitioner, availability_entity_1.Availability, appointment_entity_1.Appointment, wait_queue_entry_entity_1.WaitQueueEntry],
                    synchronize: true,
                    logging: false,
                }),
            }),
            typeorm_1.TypeOrmModule.forFeature([practitioner_entity_1.Practitioner, availability_entity_1.Availability, appointment_entity_1.Appointment, wait_queue_entry_entity_1.WaitQueueEntry]),
            event_emitter_1.EventEmitterModule.forRoot(),
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_ACCESS_SECRET', 'test-secret-key'),
                    signOptions: { expiresIn: '15m' },
                }),
            }),
        ],
        controllers: [
            appointments_controller_1.AppointmentsController,
            wait_queue_controller_1.WaitQueueController
        ],
        providers: [
            scheduling_service_1.SchedulingService,
            wait_queue_service_1.WaitQueueService,
            agenda_resolver_1.AgendaResolver,
            MockJwtStrategy,
            {
                provide: core_1.APP_GUARD,
                useClass: MockJwtAuthGuard,
            },
        ],
        exports: [
            typeorm_1.TypeOrmModule,
            scheduling_service_1.SchedulingService,
            wait_queue_service_1.WaitQueueService,
        ]
    })
], SchedulingTestModule);
//# sourceMappingURL=scheduling-test.module.js.map