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
exports.InventoryTestModule = void 0;
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
const item_entity_1 = require("../../entities/item.entity");
const lot_entity_1 = require("../../entities/lot.entity");
const movement_entity_1 = require("../../entities/movement.entity");
const supplier_entity_1 = require("../../entities/supplier.entity");
const inventory_service_1 = require("../../services/inventory.service");
const inventory_resolver_1 = require("../../resolvers/inventory.resolver");
const inventory_controller_1 = require("../../controllers/inventory.controller");
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
let InventoryTestModule = class InventoryTestModule {
};
exports.InventoryTestModule = InventoryTestModule;
exports.InventoryTestModule = InventoryTestModule = __decorate([
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
                    entities: [item_entity_1.Item, lot_entity_1.Lot, movement_entity_1.Movement, supplier_entity_1.Supplier],
                    synchronize: true,
                    logging: false,
                }),
            }),
            typeorm_1.TypeOrmModule.forFeature([item_entity_1.Item, lot_entity_1.Lot, movement_entity_1.Movement, supplier_entity_1.Supplier]),
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
        controllers: [inventory_controller_1.InventoryController],
        providers: [
            inventory_service_1.InventoryService,
            inventory_resolver_1.InventoryResolver,
            MockJwtStrategy,
            {
                provide: core_1.APP_GUARD,
                useClass: MockJwtAuthGuard,
            },
        ],
        exports: [
            typeorm_1.TypeOrmModule,
            inventory_service_1.InventoryService,
        ]
    })
], InventoryTestModule);
//# sourceMappingURL=inventory-test.module.js.map