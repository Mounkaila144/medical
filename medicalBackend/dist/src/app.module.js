"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const typeorm_1 = require("@nestjs/typeorm");
const graphql_1 = require("@nestjs/graphql");
const apollo_1 = require("@nestjs/apollo");
const patients_module_1 = require("./patients/patients.module");
const path_1 = require("path");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./auth/auth.module");
const scheduling_module_1 = require("./scheduling/scheduling.module");
const ehr_module_1 = require("./ehr/ehr.module");
const billing_module_1 = require("./billing/billing.module");
const inventory_module_1 = require("./inventory/inventory.module");
const event_emitter_1 = require("@nestjs/event-emitter");
const hr_module_1 = require("./hr/hr.module");
const analytics_module_1 = require("./analytics/analytics.module");
const core_1 = require("@nestjs/core");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env', '.env.test'],
            }),
            event_emitter_1.EventEmitterModule.forRoot(),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const dbType = configService.get('DATABASE_TYPE') || configService.get('DB_TYPE') || 'postgres';
                    if (dbType === 'sqlite') {
                        return {
                            type: 'sqlite',
                            database: configService.get('DATABASE_MEMORY') === 'true' ? ':memory:' : 'db.sqlite',
                            entities: [
                                __dirname + '/auth/entities/*.entity{.ts,.js}',
                                __dirname + '/patients/entities/*.entity{.ts,.js}',
                                __dirname + '/scheduling/entities/*.entity{.ts,.js}',
                                __dirname + '/ehr/entities/*.entity{.ts,.js}',
                                __dirname + '/billing/entities/*.entity{.ts,.js}',
                                __dirname + '/inventory/entities/*.entity{.ts,.js}',
                                __dirname + '/hr/entities/*.entity{.ts,.js}',
                                __dirname + '/analytics/entities/*.entity{.ts,.js}',
                            ],
                            synchronize: true,
                            logging: configService.get('NODE_ENV') !== 'production',
                        };
                    }
                    if (dbType === 'mysql') {
                        return {
                            type: 'mysql',
                            host: configService.get('DATABASE_HOST') || configService.get('DB_HOST', 'localhost'),
                            port: configService.get('DATABASE_PORT') || configService.get('DB_PORT', 3306),
                            username: configService.get('DATABASE_USERNAME') || configService.get('DB_USERNAME', 'root'),
                            password: configService.get('DATABASE_PASSWORD') || configService.get('DB_PASSWORD', ''),
                            database: configService.get('DATABASE_NAME') || configService.get('DB_NAME', 'medical'),
                            entities: [
                                __dirname + '/auth/entities/*.entity{.ts,.js}',
                                __dirname + '/patients/entities/*.entity{.ts,.js}',
                                __dirname + '/scheduling/entities/*.entity{.ts,.js}',
                                __dirname + '/ehr/entities/*.entity{.ts,.js}',
                                __dirname + '/billing/entities/*.entity{.ts,.js}',
                                __dirname + '/inventory/entities/*.entity{.ts,.js}',
                                __dirname + '/hr/entities/*.entity{.ts,.js}',
                                __dirname + '/analytics/entities/*.entity{.ts,.js}',
                            ],
                            synchronize: configService.get('NODE_ENV') !== 'production',
                            logging: configService.get('NODE_ENV') !== 'production',
                        };
                    }
                    return {
                        type: 'postgres',
                        host: configService.get('DATABASE_HOST') || configService.get('DB_HOST'),
                        port: configService.get('DATABASE_PORT') || configService.get('DB_PORT', 5432),
                        username: configService.get('DATABASE_USERNAME') || configService.get('DB_USERNAME'),
                        password: configService.get('DATABASE_PASSWORD') || configService.get('DB_PASSWORD'),
                        database: configService.get('DATABASE_NAME') || configService.get('DB_NAME'),
                        entities: [
                            __dirname + '/auth/entities/*.entity{.ts,.js}',
                            __dirname + '/patients/entities/*.entity{.ts,.js}',
                            __dirname + '/scheduling/entities/*.entity{.ts,.js}',
                            __dirname + '/ehr/entities/*.entity{.ts,.js}',
                            __dirname + '/billing/entities/*.entity{.ts,.js}',
                            __dirname + '/inventory/entities/*.entity{.ts,.js}',
                            __dirname + '/hr/entities/*.entity{.ts,.js}',
                            __dirname + '/analytics/entities/*.entity{.ts,.js}',
                        ],
                        synchronize: configService.get('NODE_ENV') !== 'production',
                        logging: configService.get('NODE_ENV') !== 'production',
                        ssl: false,
                    };
                },
            }),
            graphql_1.GraphQLModule.forRoot({
                driver: apollo_1.ApolloDriver,
                autoSchemaFile: (0, path_1.join)(process.cwd(), 'src/schema.gql'),
                sortSchema: true,
                playground: true,
            }),
            patients_module_1.PatientsModule,
            auth_module_1.AuthModule,
            scheduling_module_1.SchedulingModule,
            ehr_module_1.EhrModule,
            billing_module_1.BillingModule,
            inventory_module_1.InventoryModule,
            hr_module_1.HrModule,
            analytics_module_1.AnalyticsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map