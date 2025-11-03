import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Encounter, Prescription, PrescriptionItem, LabResult, AuditLog } from './entities';
import { EncountersService, PrescriptionsService, LabResultsService } from './services';
import { EncountersController, PrescriptionsController, LabResultsController } from './controllers';
import { EncountersResolver, PrescriptionsResolver, LabResultsResolver } from './resolvers';
import { EHRSupervisorGuard } from './guards/ehr-supervisor.guard';
import { CommonModule } from '../common/common.module';
import { Tenant } from '../auth/entities/tenant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Encounter, Prescription, PrescriptionItem, LabResult, AuditLog, Tenant]),
    EventEmitterModule.forRoot(),
    CommonModule,
  ],
  controllers: [EncountersController, PrescriptionsController, LabResultsController],
  providers: [
    EncountersService, 
    PrescriptionsService, 
    LabResultsService, 
    EncountersResolver, 
    PrescriptionsResolver, 
    LabResultsResolver,
    EHRSupervisorGuard,
  ],
  exports: [EncountersService, PrescriptionsService, LabResultsService],
})
export class EhrModule {} 