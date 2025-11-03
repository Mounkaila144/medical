import './setup-env';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Connection, Repository } from 'typeorm';
import { BillingTestModule } from './billing-test.module';
import { TestTariff, TestUser, TestTenant, TestPatient } from './entities';
import { TariffCategory } from '../src/billing/entities/tariff.entity';
import { AuthUserRole } from '../src/auth/entities/user.entity';
import { Gender } from '../src/patients/entities/patient.entity';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import * as jwt from 'jsonwebtoken';

// Augmenter le timeout de Jest pour éviter les problèmes avec SQLite
jest.setTimeout(30000);

describe('Billing Module (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let tariffRepository: Repository<TestTariff>;
  let userRepository: Repository<TestUser>;
  let tenantRepository: Repository<TestTenant>;
  let patientRepository: Repository<TestPatient>;
  
  // Tokens JWT pour l'authentification
  let adminToken: string;
  
  // IDs
  let tenantId: string;
  let userId: string;
  let patientId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [BillingTestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    connection = app.get(Connection);
    tariffRepository = connection.getRepository(TestTariff);
    userRepository = connection.getRepository(TestUser);
    tenantRepository = connection.getRepository(TestTenant);
    patientRepository = connection.getRepository(TestPatient);

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
      role: AuthUserRole.CLINIC_ADMIN,
      tenantId: tenant.id,
      isActive: true,
    });
    await userRepository.save(admin);
    userId = admin.id;

    // Créer un patient pour les tests
    const patient = patientRepository.create({
      clinicId: tenantId,
      mrn: 'MRN12345',
      firstName: 'John',
      lastName: 'Doe',
      dob: new Date('1980-01-01'),
      gender: Gender.MALE,
      address: JSON.stringify({
        street: '123 Main St',
        city: 'Anytown',
        country: 'Countryland',
        postalCode: '12345'
      }),
      phone: '555-1234',
      email: 'john.doe@example.com',
    });
    await patientRepository.save(patient);
    patientId = patient.id;

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

  describe('Tariffs', () => {
    it('should create a tariff', async () => {
      const createTariffDto = {
        code: 'CONS001',
        label: 'Consultation standard',
        price: '50.00',
        category: TariffCategory.CONSULTATION,
      };

      const response = await request(app.getHttpServer())
        .post('/tariffs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createTariffDto)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.code).toBe(createTariffDto.code);
      expect(response.body.label).toBe(createTariffDto.label);
      expect(response.body.price).toBe(createTariffDto.price);
      expect(response.body.category).toBe(createTariffDto.category);
      expect(response.body.tenantId).toBeDefined();
    });

    it('should get all tariffs', async () => {
      const response = await request(app.getHttpServer())
        .get('/tariffs')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should get tariffs by category', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tariffs/category/${TariffCategory.CONSULTATION}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].category).toBe(TariffCategory.CONSULTATION);
    });
  });
}); 