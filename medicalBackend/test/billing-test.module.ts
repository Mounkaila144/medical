import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

// Entités de test
import { 
  TestTariff, 
  TestTenant, 
  TestUser, 
  TestSession, 
  TestPatient, 
  TestInvoice, 
  TestInvoiceLine, 
  TestPayment, 
  TestMedicalHistoryItem, 
  TestScannedDocument 
} from './entities';

// Services
import { InvoicingService, PaymentsService } from '../src/billing/services';

// Contrôleurs
import { InvoicesController, PaymentsController } from '../src/billing/controllers';
import { MockTariffsController } from './tariffs.controller.mock';

// Résolveurs
import { InvoicesResolver, PaymentsResolver } from '../src/billing/resolvers';

// Guards et stratégies
import { JwtAccessStrategy } from '../src/auth/strategies/jwt-access.strategy';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { TenantGuard } from '../src/common/guards/tenant.guard';

// Entités originales
import { Invoice, InvoiceLine, Payment, Tariff } from '../src/billing/entities';

// Mock du RolesGuard pour les tests
class MockRolesGuard {
  canActivate() {
    return true;
  }
}

// Mock du TenantGuard pour les tests
class MockTenantGuard {
  canActivate() {
    return true;
  }
}

// Stratégie JWT pour Passport
class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'test-jwt-secret',
    });
  }

  async validate(payload: any) {
    return { 
      id: payload.sub, 
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
      isActive: true
    };
  }
}

// Mock de JwtAuthGuard
class MockJwtAuthGuard {
  canActivate() {
    return true;
  }
}

// Cette classe de service remplace UsersService
class MockUsersService {
  constructor() {}

  async findById(id: string) {
    return { 
      id, 
      isActive: true,
      email: 'admin@test.com',
      passwordHash: 'hash',
      firstName: 'Test',
      lastName: 'User',
      role: 'CLINIC_ADMIN',
      tenantId: '123',
      createdAt: new Date(),
      updatedAt: new Date(),
      tenant: { id: '123', name: 'Test Tenant' }
    };
  }

  async findByEmail(email: string) {
    return { 
      id: '123', 
      isActive: true,
      email: email,
      passwordHash: 'hash',
      firstName: 'Test',
      lastName: 'User',
      role: 'CLINIC_ADMIN',
      tenantId: '123',
      createdAt: new Date(),
      updatedAt: new Date(),
      tenant: { id: '123', name: 'Test Tenant' }
    };
  }
}

// Fonction d'aide pour créer un MockRepository
const createMockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getMany: jest.fn(),
    execute: jest.fn()
  })),
});

// Service de mocking pour InvoicingService
class MockInvoicingService {
  constructor() {}
  
  async create() {
    return { id: '123', tenantId: '123', number: 'INV-001', status: 'PENDING', total: 100 };
  }

  async findAll() {
    return [{ id: '123', tenantId: '123', number: 'INV-001', status: 'PENDING', total: 100 }];
  }

  async findOne() {
    return { id: '123', tenantId: '123', number: 'INV-001', status: 'PENDING', total: 100 };
  }

  async update() {
    return { id: '123', tenantId: '123', number: 'INV-001', status: 'PAID', total: 100 };
  }

  async remove() {
    return { id: '123', tenantId: '123', number: 'INV-001', status: 'CANCELLED', total: 100 };
  }
}

// Service de mocking pour PaymentsService
class MockPaymentsService {
  constructor() {}
  
  async create() {
    return { id: '123', invoiceId: '123', amount: 100, method: 'CASH' };
  }

  async findAll() {
    return [{ id: '123', invoiceId: '123', amount: 100, method: 'CASH' }];
  }

  async findOne() {
    return { id: '123', invoiceId: '123', amount: 100, method: 'CASH' };
  }
}

// EventEmitter mock
class MockEventEmitter {
  emit() {
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
      useFactory: () => ({
        type: 'sqlite',
        database: ':memory:',
        entities: [
          TestTariff,
          TestInvoice,
          TestInvoiceLine,
          TestPayment,
          TestUser,
          TestTenant,
          TestSession,
          TestPatient,
          TestMedicalHistoryItem,
          TestScannedDocument
        ],
        synchronize: true,
        logging: false,
      }),
    }),
    TypeOrmModule.forFeature([
      TestTariff,
      TestInvoice,
      TestInvoiceLine,
      TestPayment,
      TestUser,
      TestTenant,
      TestSession,
      TestPatient,
      TestMedicalHistoryItem,
      TestScannedDocument
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET') || 'test-jwt-secret',
        signOptions: { expiresIn: '15m' },
      }),
    }),
    EventEmitterModule.forRoot(),
  ],
  controllers: [InvoicesController, PaymentsController, MockTariffsController],
  providers: [
    // Services mockés
    {
      provide: InvoicingService,
      useClass: MockInvoicingService
    },
    {
      provide: PaymentsService,
      useClass: MockPaymentsService
    },
    {
      provide: 'UsersService',
      useClass: MockUsersService
    },
    // Résolveurs
    InvoicesResolver,
    PaymentsResolver,
    // Stratégies
    JwtStrategy,
    {
      provide: JwtAccessStrategy,
      useClass: JwtStrategy
    },
    // Guards
    {
      provide: RolesGuard,
      useClass: MockRolesGuard,
    },
    {
      provide: JwtAuthGuard,
      useClass: MockJwtAuthGuard,
    },
    {
      provide: TenantGuard,
      useClass: MockTenantGuard,
    },
    // EventEmitter
    {
      provide: 'EventEmitter',
      useClass: MockEventEmitter
    },
    // Repositories
    {
      provide: getRepositoryToken(Invoice),
      useFactory: createMockRepository
    },
    {
      provide: getRepositoryToken(InvoiceLine),
      useFactory: createMockRepository
    },
    {
      provide: getRepositoryToken(Payment),
      useFactory: createMockRepository
    },
    {
      provide: getRepositoryToken(Tariff),
      useFactory: createMockRepository
    },
  ],
  exports: [TypeOrmModule],
})
export class BillingTestModule {} 