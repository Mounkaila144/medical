import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';

// Entités - utiliser les vraies entités (compatibles SQLite après correction)
import { Encounter } from '../src/ehr/entities/encounter.entity';
import { Prescription } from '../src/ehr/entities/prescription.entity';
import { PrescriptionItem } from '../src/ehr/entities/prescription-item.entity';
import { LabResult } from '../src/ehr/entities/lab-result.entity';
import { AuditLog } from '../src/ehr/entities/audit-log.entity';
import { Patient } from '../src/patients/entities/patient.entity';
import { Practitioner } from '../src/scheduling/entities/practitioner.entity';
import { User } from '../src/auth/entities/user.entity';
import { Tenant } from '../src/auth/entities/tenant.entity';
import { Availability } from '../src/scheduling/entities/availability.entity';
import { Appointment } from '../src/scheduling/entities/appointment.entity';
import { WaitQueueEntry } from '../src/scheduling/entities/wait-queue-entry.entity';
import { MedicalHistoryItem } from '../src/patients/entities/medical-history-item.entity';
import { ScannedDocument } from '../src/patients/entities/scanned-document.entity';
import { Session } from '../src/auth/entities/session.entity';
import { MinioService } from '../src/common/services/minio.service';

// Services
import { EncountersService } from '../src/ehr/services/encounters.service';
import { PrescriptionsService } from '../src/ehr/services/prescriptions.service';
import { LabResultsService } from '../src/ehr/services/lab-results.service';

// Contrôleurs
import { EncountersController } from '../src/ehr/controllers/encounters.controller';
import { PrescriptionsController } from '../src/ehr/controllers/prescriptions.controller';
import { LabResultsController } from '../src/ehr/controllers/lab-results.controller';

// Resolvers
import { EncountersResolver } from '../src/ehr/resolvers/encounters.resolver';
import { PrescriptionsResolver } from '../src/ehr/resolvers/prescriptions.resolver';
import { LabResultsResolver } from '../src/ehr/resolvers/lab-results.resolver';

// Guards
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { GqlAuthGuard } from '../src/common/guards/gql-auth.guard';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { EHRSupervisorGuard } from '../src/ehr/guards/ehr-supervisor.guard';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

// Stratégie JWT Mock pour les tests
@Injectable()
class MockJwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: 'test-access-secret-key',
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

class MockRolesGuard {
  canActivate() {
    return true;
  }
}

class MockEHRSupervisorGuard {
  canActivate() {
    console.log('MockEHRSupervisorGuard.canActivate appelé');
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
        entities: [
          Encounter, Prescription, PrescriptionItem, LabResult, AuditLog,
          Patient, Practitioner, User, Tenant, Session, Availability, Appointment,
          WaitQueueEntry, MedicalHistoryItem, ScannedDocument,
        ],
        synchronize: true,
        logging: false,
      }),
    }),
    TypeOrmModule.forFeature([
      Encounter, Prescription, PrescriptionItem, LabResult, AuditLog,
      Patient, Practitioner, User, Tenant, Session, Availability, Appointment,
      WaitQueueEntry, MedicalHistoryItem, ScannedDocument,
    ]),
    EventEmitterModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
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
    EncountersController,
    PrescriptionsController,
    LabResultsController
  ],
  providers: [
    EncountersService,
    PrescriptionsService,
    LabResultsService,
    {
      provide: MinioService,
      useValue: {
        uploadBuffer: jest.fn().mockResolvedValue(undefined),
        getObject: jest.fn().mockResolvedValue(null),
        objectExists: jest.fn().mockResolvedValue(false),
        removeObject: jest.fn().mockResolvedValue(undefined),
      },
    },
    EncountersResolver,
    PrescriptionsResolver,
    LabResultsResolver,
    MockJwtStrategy,
    {
      provide: JwtAuthGuard,
      useClass: MockJwtAuthGuard,
    },
    {
      provide: GqlAuthGuard,
      useClass: MockGqlAuthGuard,
    },
    {
      provide: RolesGuard,
      useClass: MockRolesGuard,
    },
    {
      provide: EHRSupervisorGuard,
      useClass: MockEHRSupervisorGuard,
    },
    {
      provide: APP_GUARD,
      useClass: MockJwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: MockRolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: MockEHRSupervisorGuard,
    },
  ],
})
export class EHRTestModule {} 