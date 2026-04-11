import './setup-env';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { Tenant } from '../src/auth/entities/tenant.entity';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';

jest.setTimeout(60000);

describe('Public Endpoints (e2e)', () => {
  let app: INestApplication;
  let tenantRepository: Repository<Tenant>;

  let activeTenant: Tenant;
  let inactiveTenant: Tenant;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
    }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    tenantRepository = moduleFixture.get<Repository<Tenant>>(getRepositoryToken(Tenant));

    // Create active tenant
    activeTenant = await tenantRepository.save(
      tenantRepository.create({
        name: 'Public Test Active',
        slug: 'public-test-active',
        isActive: true,
      }),
    );

    // Create inactive tenant
    inactiveTenant = await tenantRepository.save(
      tenantRepository.create({
        name: 'Public Test Inactive',
        slug: 'public-test-inactive',
        isActive: false,
      }),
    );

    // Remove DEFAULT_TENANT_ID to test missing tenant param
    delete process.env.DEFAULT_TENANT_ID;
  });

  afterAll(async () => {
    await app.close();
  });

  // ===== WAIT QUEUE PUBLIC ENDPOINTS =====

  describe('POST /public/wait-queue', () => {
    it('should take a number with valid tenant -> 201', async () => {
      const response = await request(app.getHttpServer())
        .post('/public/wait-queue')
        .query({ tenant: activeTenant.id })
        .send({ reason: 'Consultation' });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.tenantId).toBe(activeTenant.id);
      expect(response.body.ticketNumber).toBeDefined();
      expect(response.body.status).toBe('WAITING');
    });

    it('should return 400 with invalid/non-existent tenant', async () => {
      const fakeId = uuidv4();
      const response = await request(app.getHttpServer())
        .post('/public/wait-queue')
        .query({ tenant: fakeId })
        .send({ reason: 'Consultation' });

      expect(response.status).toBe(400);
    });

    it('should return 400 without tenant param and no DEFAULT_TENANT_ID', async () => {
      const response = await request(app.getHttpServer())
        .post('/public/wait-queue')
        .send({ reason: 'Consultation' });

      expect(response.status).toBe(400);
    });

    it('should return 400 with inactive tenant', async () => {
      const response = await request(app.getHttpServer())
        .post('/public/wait-queue')
        .query({ tenant: inactiveTenant.id })
        .send({ reason: 'Consultation' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /public/wait-queue', () => {
    it('should return queue entries for valid tenant', async () => {
      // First add some entries
      await request(app.getHttpServer())
        .post('/public/wait-queue')
        .query({ tenant: activeTenant.id })
        .send({ reason: 'Consultation 1' });

      await request(app.getHttpServer())
        .post('/public/wait-queue')
        .query({ tenant: activeTenant.id })
        .send({ reason: 'Consultation 2' });

      const response = await request(app.getHttpServer())
        .get('/public/wait-queue')
        .query({ tenant: activeTenant.id });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // All entries should belong to the same tenant
      response.body.forEach((entry: any) => {
        expect(entry.tenantId).toBe(activeTenant.id);
      });
    });

    it('should return 400 without tenant param', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/wait-queue');

      expect(response.status).toBe(400);
    });

    it('should return 400 with non-existent tenant', async () => {
      const fakeId = uuidv4();
      const response = await request(app.getHttpServer())
        .get('/public/wait-queue')
        .query({ tenant: fakeId });

      expect(response.status).toBe(400);
    });
  });

  // ===== PUBLIC PATIENT REGISTRATION =====

  describe('POST /public/patients/:tenantId', () => {
    it('should return 400 with inactive tenant', async () => {
      const response = await request(app.getHttpServer())
        .post(`/public/patients/${inactiveTenant.id}`)
        .send({
          mrn: 'MRN-PUB-001',
          firstName: 'Public',
          lastName: 'Patient',
          dob: '1990-01-01',
          gender: 'M',
          phone: '555-PUB',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 with non-existent tenant', async () => {
      const fakeId = uuidv4();
      const response = await request(app.getHttpServer())
        .post(`/public/patients/${fakeId}`)
        .send({
          mrn: 'MRN-PUB-002',
          firstName: 'Public',
          lastName: 'Patient2',
          dob: '1990-01-01',
          gender: 'M',
          phone: '555-PUB2',
        });

      expect(response.status).toBe(400);
    });

    it('should create patient for active tenant -> 201', async () => {
      const response = await request(app.getHttpServer())
        .post(`/public/patients/${activeTenant.id}`)
        .send({
          clinicId: activeTenant.id,
          mrn: `MRN-PUB-${Date.now()}`,
          firstName: 'PublicCreated',
          lastName: 'Patient',
          dob: '1990-01-01',
          gender: 'M',
          phone: '555-PUB3',
          address: { street: '123 Public St', city: 'Niamey' },
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.redirectUrl).toBeDefined();
    });
  });

  // ===== NO AUTH REQUIRED ON PUBLIC ENDPOINTS =====

  describe('Public endpoints do not require authentication', () => {
    it('GET /public/wait-queue works without auth header', async () => {
      const response = await request(app.getHttpServer())
        .get('/public/wait-queue')
        .query({ tenant: activeTenant.id });

      // Should NOT be 401
      expect(response.status).not.toBe(401);
      expect(response.status).toBe(200);
    });

    it('POST /public/wait-queue works without auth header', async () => {
      const response = await request(app.getHttpServer())
        .post('/public/wait-queue')
        .query({ tenant: activeTenant.id })
        .send({ reason: 'No auth test' });

      expect(response.status).not.toBe(401);
      expect(response.status).toBe(201);
    });
  });
});
