import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

// Entités
import { Item } from '../../entities/item.entity';
import { Lot } from '../../entities/lot.entity';
import { Movement } from '../../entities/movement.entity';
import { Supplier } from '../../entities/supplier.entity';

// Services
import { InventoryService } from '../../services/inventory.service';

// Resolvers et Controllers
import { InventoryResolver } from '../../resolvers/inventory.resolver';
import { InventoryController } from '../../controllers/inventory.controller';

// Stratégie JWT Mock pour les tests
@Injectable()
class MockJwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: 'test-secret-key',
    });
  }

  async validate(payload: any) {
    return { 
      userId: payload.id, 
      email: payload.email, 
      tenantId: payload.tenantId, 
      roles: payload.roles 
    };
  }
}

// Mock Guards pour tests
class MockJwtAuthGuard {
  canActivate() {
    return true;
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: ':memory:',
        entities: [Item, Lot, Movement, Supplier],
        synchronize: true,
        logging: false,
      }),
    }),
    TypeOrmModule.forFeature([Item, Lot, Movement, Supplier]),
    EventEmitterModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET', 'test-secret-key'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [InventoryController],
  providers: [
    InventoryService,
    InventoryResolver,
    MockJwtStrategy,
    {
      provide: APP_GUARD,
      useClass: MockJwtAuthGuard,
    },
  ],
  exports: [
    TypeOrmModule,
    InventoryService,
  ]
})
export class InventoryTestModule {} 