import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';

// Entités adaptées pour SQLite
import { Patient } from './mocks/entities/patient.entity';
import { MedicalHistoryItem } from './mocks/entities/medical-history-item.entity';
import { ScannedDocument } from './mocks/entities/scanned-document.entity';
import { User } from './mocks/entities/user.entity';
import { Tenant } from './mocks/entities/tenant.entity';
import { Session } from './mocks/entities/session.entity';

// Services du module Patients
import { PatientsService } from '../src/patients/services/patients.service';
import { MedicalHistoryService } from '../src/patients/services/medical-history.service';
import { DocumentsService } from '../src/patients/services/documents.service';
import { PatientsMockService } from './patients-mock.service';

// Contrôleurs
import { PatientsController } from '../src/patients/controllers/patients.controller';
import { MedicalHistoryController } from '../src/patients/controllers/medical-history.controller';
import { DocumentsController } from '../src/patients/controllers/documents.controller';

// Guards
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { TenantGuard } from '../src/common/guards/tenant.guard';

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

// Mock pour RabbitMQ
const mockRabbitMQService = {
  emit: jest.fn().mockImplementation(() => {
    return {
      pipe: jest.fn(),
      toPromise: jest.fn(),
    };
  }),
  send: jest.fn().mockImplementation(() => {
    return {
      pipe: jest.fn(),
      toPromise: jest.fn(),
    };
  }),
};

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
      userId: payload.sub, 
      email: payload.email, 
      role: payload.role,
      tenantId: payload.tenantId
    };
  }
}

// Mock Guards pour tests
class MockJwtAuthGuard {
  canActivate() {
    return true;
  }
}

class MockRolesGuard {
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
        entities: [
          Patient, 
          MedicalHistoryItem, 
          ScannedDocument, 
          User, 
          Tenant, 
          Session
        ],
        synchronize: true,
        logging: false,
      }),
    }),
    TypeOrmModule.forFeature([
      Patient,
      MedicalHistoryItem,
      ScannedDocument,
      User,
      Tenant,
      Session
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
    PatientsController,
    MedicalHistoryController,
    DocumentsController
  ],
  providers: [
    {
      provide: PatientsService,
      useClass: PatientsMockService,
    },
    MedicalHistoryService,
    DocumentsService,
    MockJwtStrategy,
    {
      provide: 'RABBITMQ_SERVICE',
      useValue: mockRabbitMQService,
    },
    {
      provide: JwtAuthGuard,
      useClass: MockJwtAuthGuard,
    },
    {
      provide: RolesGuard,
      useClass: MockRolesGuard,
    },
    {
      provide: TenantGuard,
      useClass: MockTenantGuard,
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
      useClass: MockTenantGuard,
    },
  ],
  exports: [
    TypeOrmModule,
    JwtModule
  ]
})
export class PatientsTestModule {} 