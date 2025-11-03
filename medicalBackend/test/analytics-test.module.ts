import { Module } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

// Entités de test
import { 
  TestTenant, 
  TestUser, 
  TestReport,
  TestSession 
} from './entities';

// Services
import { AnalyticsService } from '../src/analytics/services';

// Contrôleurs
import { ReportsController } from '../src/analytics/controllers';

// Guards et stratégies
import { JwtAccessStrategy } from '../src/auth/strategies/jwt-access.strategy';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { TenantGuard } from '../src/common/guards/tenant.guard';

// Entités originales
import { Report } from '../src/analytics/entities';

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
      role: 'ADMIN',
      tenantId: '123',
      createdAt: new Date(),
      updatedAt: new Date(),
      tenant: { id: '123', name: 'Test Tenant' }
    };
  }
}

// Service de mocking pour AnalyticsService
class MockAnalyticsService {
  constructor() {}
  
  async generate(tenantId: string, dto: any) {
    return { 
      id: '123', 
      tenantId, 
      name: dto.name, 
      params: dto.params, 
      generatedPath: 'storage/reports/123/report_123456789.pdf',
      format: dto.format || 'PDF',
      createdAt: new Date()
    };
  }

  async refreshMaterializedViews() {
    return { message: 'Materialized views refreshed successfully' };
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
          TestTenant,
          TestUser,
          TestReport,
          TestSession
        ],
        synchronize: true,
        logging: false,
      }),
    }),
    TypeOrmModule.forFeature([
      TestTenant,
      TestUser,
      TestReport,
      TestSession
    ]),
    JwtModule.register({
      secret: 'test-jwt-secret',
      signOptions: { expiresIn: '1h' },
    }),
    PassportModule,
  ],
  controllers: [
    ReportsController,
  ],
  providers: [
    {
      provide: AnalyticsService,
      useClass: MockAnalyticsService,
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
    JwtStrategy,
    {
      provide: getRepositoryToken(Report),
      useFactory: () => ({
        find: jest.fn().mockImplementation((options) => {
          return [
            { 
              id: '123', 
              tenantId: options.where.tenantId, 
              name: 'Test Report', 
              params: { startDate: '2023-01-01', endDate: '2023-01-31' }, 
              generatedPath: 'storage/reports/123/report_123456789.pdf',
              format: 'PDF',
              createdAt: new Date()
            }
          ];
        }),
        findOne: jest.fn().mockImplementation((options) => {
          if (options.where.id === 'non-existent') {
            return null;
          }
          return { 
            id: options.where.id, 
            tenantId: options.where.tenantId, 
            name: 'Test Report', 
            params: { startDate: '2023-01-01', endDate: '2023-01-31' }, 
            generatedPath: 'storage/reports/123/report_123456789.pdf',
            format: 'PDF',
            createdAt: new Date()
          };
        }),
        create: jest.fn().mockImplementation((entity) => entity),
        save: jest.fn().mockImplementation((entity) => ({
          id: '123',
          ...entity,
          createdAt: new Date()
        })),
      }),
    },
  ],
  exports: [
    TypeOrmModule,
    AnalyticsService,
  ],
})
export class AnalyticsTestModule {} 