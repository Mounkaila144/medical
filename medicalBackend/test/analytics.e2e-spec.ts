import './setup-env';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Connection, Repository } from 'typeorm';
import { AnalyticsTestModule } from './analytics-test.module';
import { TestReport, TestUser, TestTenant } from './entities';
import { ReportFormat } from '../src/analytics/entities/report.entity';
import { ReportType } from '../src/analytics/dto/generate-report.dto';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import * as jwt from 'jsonwebtoken';

// Augmenter le timeout de Jest pour éviter les problèmes avec SQLite
jest.setTimeout(30000);

describe('Analytics Module (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let reportRepository: Repository<TestReport>;
  let userRepository: Repository<TestUser>;
  let tenantRepository: Repository<TestTenant>;
  
  // Tokens JWT pour l'authentification
  let adminToken: string;
  
  // IDs
  let tenantId: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AnalyticsTestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    connection = app.get(Connection);
    reportRepository = connection.getRepository(TestReport);
    userRepository = connection.getRepository(TestUser);
    tenantRepository = connection.getRepository(TestTenant);

    // Créer un tenant pour les tests
    const tenant = tenantRepository.create({
      name: 'Clinique Test',
      slug: 'clinique-test',
      isActive: true,
    });
    await tenantRepository.save(tenant);
    tenantId = tenant.id;

    // Créer un utilisateur admin pour les tests
    const admin = userRepository.create({
      email: 'admin@clinique-test.com',
      passwordHash: await require('bcrypt').hash('password123', 10),
      firstName: 'Admin',
      lastName: 'Test',
      role: 'ADMIN',
      tenantId: tenant.id,
      isActive: true,
    });
    await userRepository.save(admin);
    userId = admin.id;

    // Générer un token JWT pour l'admin
    adminToken = jwt.sign(
      { 
        email: admin.email,
        sub: admin.id,
        role: 'ADMIN',
        tenantId: admin.tenantId
      },
      'test-jwt-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    if (connection) {
      await connection.destroy();
    }
    if (app) {
      await app.close();
    }
  });

  describe('Reports', () => {
    it('should generate a report', async () => {
      const generateReportDto = {
        reportType: ReportType.DAILY_REVENUE,
        name: 'Daily Revenue Report',
        params: {
          startDate: '2023-01-01',
          endDate: '2023-01-31',
        },
        format: ReportFormat.PDF,
      };

      const response = await request(app.getHttpServer())
        .post('/reports')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(generateReportDto)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.name).toBe(generateReportDto.name);
      expect(response.body.format).toBe(generateReportDto.format);
      expect(response.body.tenantId).toBeDefined();
      expect(response.body.generatedPath).toBeDefined();
    });

    it('should get all reports', async () => {
      const response = await request(app.getHttpServer())
        .get('/reports')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get a report by id', async () => {
      // Créer un rapport pour le test
      const report = reportRepository.create({
        tenantId,
        name: 'Test Report',
        params: { startDate: '2023-01-01', endDate: '2023-01-31' },
        generatedPath: 'storage/reports/tenant-1/Test_Report_123456789.pdf',
        format: ReportFormat.PDF,
      });
      await reportRepository.save(report);

      const response = await request(app.getHttpServer())
        .get(`/reports/${report.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(report.id);
      expect(response.body.name).toBe(report.name);
      expect(response.body.format).toBe(report.format);
    });

    it('should refresh materialized views', async () => {
      const response = await request(app.getHttpServer())
        .post('/reports/refresh-views')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.message).toBe('Materialized views refreshed successfully');
    });
  });
}); 