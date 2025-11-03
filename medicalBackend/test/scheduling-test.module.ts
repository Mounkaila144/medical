import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';

// Entités adaptées pour SQLite
import { Practitioner } from './mocks/entities/practitioner.entity';
import { Availability } from './mocks/entities/availability.entity';
import { Appointment } from './mocks/entities/appointment.entity';
import { WaitQueueEntry } from './mocks/entities/wait-queue-entry.entity';

// Services
import { SchedulingService } from '../src/scheduling/services/scheduling.service';
import { WaitQueueService } from '../src/scheduling/services/wait-queue.service';

// Contrôleurs existants
import { AppointmentsController } from '../src/scheduling/controllers/appointments.controller';
import { WaitQueueController } from '../src/scheduling/controllers/wait-queue.controller';

// Resolvers GraphQL existants
import { AgendaResolver } from '../src/scheduling/resolvers/agenda.resolver';

// Guards
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { GqlAuthGuard } from '../src/auth/guards/gql-auth.guard';
import { TenantGuard } from '../src/common/guards/tenant.guard';

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
    ScheduleModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET', 'test-access-secret-key'),
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
    {
      provide: JwtAuthGuard,
      useClass: MockJwtAuthGuard,
    },
    {
      provide: GqlAuthGuard,
      useClass: MockGqlAuthGuard,
    },
    {
      provide: TenantGuard,
      useClass: MockTenantGuard,
    },
    {
      provide: APP_GUARD,
      useClass: MockJwtAuthGuard,
    },
  ],
})
export class SchedulingTestModule {} 