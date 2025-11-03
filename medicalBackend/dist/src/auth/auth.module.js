"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("./entities/user.entity");
const tenant_entity_1 = require("./entities/tenant.entity");
const session_entity_1 = require("./entities/session.entity");
const practitioner_entity_1 = require("../scheduling/entities/practitioner.entity");
const auth_service_1 = require("./services/auth.service");
const users_service_1 = require("./services/users.service");
const superadmin_service_1 = require("./services/superadmin.service");
const practitioner_auth_service_1 = require("./services/practitioner-auth.service");
const auth_controller_1 = require("./controllers/auth.controller");
const admin_controller_1 = require("./controllers/admin.controller");
const users_controller_1 = require("./controllers/users.controller");
const practitioner_auth_controller_1 = require("./controllers/practitioner-auth.controller");
const local_strategy_1 = require("./strategies/local.strategy");
const jwt_access_strategy_1 = require("./strategies/jwt-access.strategy");
const jwt_refresh_strategy_1 = require("./strategies/jwt-refresh.strategy");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const roles_guard_1 = require("./guards/roles.guard");
const gql_roles_guard_1 = require("./guards/gql-roles.guard");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, tenant_entity_1.Tenant, session_entity_1.Session, practitioner_entity_1.Practitioner]),
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_ACCESS_SECRET'),
                    signOptions: { expiresIn: '15m' },
                }),
            }),
        ],
        controllers: [auth_controller_1.AuthController, admin_controller_1.AdminController, users_controller_1.UsersController, practitioner_auth_controller_1.PractitionerAuthController],
        providers: [
            auth_service_1.AuthService,
            users_service_1.UsersService,
            superadmin_service_1.SuperadminService,
            practitioner_auth_service_1.PractitionerAuthService,
            local_strategy_1.LocalStrategy,
            jwt_access_strategy_1.JwtAccessStrategy,
            jwt_refresh_strategy_1.JwtRefreshStrategy,
            jwt_auth_guard_1.JwtAuthGuard,
            roles_guard_1.RolesGuard,
            gql_roles_guard_1.GqlRolesGuard,
        ],
        exports: [
            auth_service_1.AuthService,
            users_service_1.UsersService,
            superadmin_service_1.SuperadminService,
            practitioner_auth_service_1.PractitionerAuthService,
            jwt_auth_guard_1.JwtAuthGuard,
            roles_guard_1.RolesGuard,
            gql_roles_guard_1.GqlRolesGuard
        ],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map