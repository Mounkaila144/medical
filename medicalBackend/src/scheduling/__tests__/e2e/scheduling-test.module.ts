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

// Entités mock adaptées à SQLite
import { Practitioner } from './mocks/entities/practitioner.entity';
import { Availability } from './mocks/entities/availability.entity';
import { Appointment } from './mocks/entities/appointment.entity';
import { WaitQueueEntry } from './mocks/entities/wait-queue-entry.entity';

// Services
import { SchedulingService } from '../../services/scheduling.service';
import { WaitQueueService } from '../../services/wait-queue.service';

// Contrôleurs
import { AppointmentsController } from '../../controllers/appointments.controller';
import { WaitQueueController } from '../../controllers/wait-queue.controller';

// Resolvers
import { AgendaResolver } from '../../resolvers/agenda.resolver';

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
        entities: [Practitioner, Availability, Appointment, WaitQueueEntry],
        synchronize: true,
        logging: false,
      }),
    }),
    TypeOrmModule.forFeature([Practitioner, Availability, Appointment, WaitQueueEntry]),
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
  controllers: [
    AppointmentsController,
    WaitQueueController
  ],
  providers: [
    SchedulingService,
    WaitQueueService,
    AgendaResolver,
    MockJwtStrategy,
    {
      provide: APP_GUARD,
      useClass: MockJwtAuthGuard,
    },
  ],
  exports: [
    TypeOrmModule,
    SchedulingService,
    WaitQueueService,
  ]
})
export class SchedulingTestModule {} 