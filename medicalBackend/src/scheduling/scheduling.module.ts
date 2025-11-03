import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { Practitioner } from './entities/practitioner.entity';
import { Availability } from './entities/availability.entity';
import { Appointment } from './entities/appointment.entity';
import { WaitQueueEntry } from './entities/wait-queue-entry.entity';

import { SchedulingService } from './services/scheduling.service';
import { WaitQueueService } from './services/wait-queue.service';
import { PractitionersService } from './services/practitioners.service';

import { AppointmentsController } from './controllers/appointments.controller';
import { WaitQueueController } from './controllers/wait-queue.controller';
import { PublicWaitQueueController } from './controllers/public-wait-queue.controller';
import { WaitQueueTestController } from './controllers/wait-queue-test.controller';
import { TestSimpleController } from './controllers/test-simple.controller';
import { PractitionersController } from './controllers/practitioners.controller';
import { PractitionerScheduleController } from './controllers/practitioner-schedule.controller';

import { AgendaResolver } from './resolvers/agenda.resolver';
import { QueueGateway } from './gateways/queue.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Practitioner,
      Availability,
      Appointment,
      WaitQueueEntry,
    ]),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    AuthModule,
  ],
  providers: [
    SchedulingService,
    WaitQueueService,
    PractitionersService,
    AgendaResolver,
    QueueGateway,
  ],
  controllers: [
    AppointmentsController,
    WaitQueueController,
    PublicWaitQueueController,  // Endpoint public sans auth
    WaitQueueTestController,
    TestSimpleController,
    PractitionersController,
    PractitionerScheduleController,
  ],
  exports: [
    SchedulingService,
    WaitQueueService,
    PractitionersService,
  ],
})
export class SchedulingModule {} 