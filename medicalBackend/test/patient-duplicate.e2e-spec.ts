import './setup-env';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { User, AuthUserRole } from '../src/auth/entities/user.entity';
import { Tenant } from '../src/auth/entities/tenant.entity';
import { Patient, Gender } from '../src/patients/entities/patient.entity';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

jest.setTimeout(60000);

describe('Patient Duplicate Detection (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let tenantRepository: Repository<Tenant>;
  let patientRepository: Repository<Patient>;

  // Tenant A
  let tenantA: Tenant;
  let tokenA: string;

  // Tenant B
  let tenantB: Tenant;
  let tokenB: string;

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

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    tenantRepository = moduleFixture.get<Repository<Tenant>>(getRepositoryToken(Tenant));
    patientRepository = moduleFixture.get<Repository<Patient>>(getRepositoryToken(Patient));

    const passwordHash = await bcrypt.hash('password123', 10);

    // Create Tenant A
    tenantA = await tenantRepository.save(
      tenantRepository.create({ name: 'Dup Test A', slug: 'dup-test-a', isActive: true }),
    );

    // Create Tenant B
    tenantB = await tenantRepository.save(
      tenantRepository.create({ name: 'Dup Test B', slug: 'dup-test-b', isActive: true }),
    );

    // Create user for Tenant A
    await userRepository.save(
      userRepository.create({
        email: 'dup-a@example.com',
        passwordHash,
        firstName: 'DupA',
        lastName: 'User',
        role: AuthUserRole.EMPLOYEE,
        tenantId: tenantA.id,
        isActive: true,
      }),
    );

    // Create user for Tenant B
    await userRepository.save(
      userRepository.create({
        email: 'dup-b@example.com',
        passwordHash,
        firstName: 'DupB',
        lastName: 'User',
        role: AuthUserRole.EMPLOYEE,
        tenantId: tenantB.id,
        isActive: true,
      }),
    );

    // Create patient "Jean Dupont" in Tenant A
    await patientRepository.save(
      patientRepository.create({
        clinicId: tenantA.id,
        mrn: 'MRN-DUP-001',
        firstName: 'Jean',
        lastName: 'Dupont',
        dob: new Date('1990-01-15'),
        gender: Gender.MALE,
        phone: '555-DUP1',
      }),
    );

    // Login both users
    const loginA = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'dup-a@example.com', password: 'password123' });
    tokenA = loginA.body.accessToken;

    const loginB = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'dup-b@example.com', password: 'password123' });
    tokenB = loginB.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Duplicate check within same tenant', () => {
    it('should find duplicate when searching with matching name (case-insensitive)', async () => {
      const response = await request(app.getHttpServer())
        .get('/patients/check-duplicate')
        .query({ firstName: 'jean', lastName: 'dupont' })
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(response.body.hasDuplicates).toBe(true);
      expect(response.body.duplicates.length).toBeGreaterThan(0);
      expect(response.body.duplicates[0].firstName).toBe('Jean');
      expect(response.body.duplicates[0].lastName).toBe('Dupont');
    });

    it('should find duplicate with different case (Jean -> JEAN)', async () => {
      const response = await request(app.getHttpServer())
        .get('/patients/check-duplicate')
        .query({ firstName: 'JEAN', lastName: 'DUPONT' })
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(response.body.hasDuplicates).toBe(true);
    });

    it('should return no duplicates for non-matching name', async () => {
      const response = await request(app.getHttpServer())
        .get('/patients/check-duplicate')
        .query({ firstName: 'Pierre', lastName: 'Martin' })
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(response.body.hasDuplicates).toBe(false);
      expect(response.body.duplicates.length).toBe(0);
    });
  });

  describe('Duplicate check respects tenant isolation', () => {
    it('Tenant B search should NOT find Tenant A patient "Jean Dupont"', async () => {
      const response = await request(app.getHttpServer())
        .get('/patients/check-duplicate')
        .query({ firstName: 'jean', lastName: 'dupont' })
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(200);

      expect(response.body.hasDuplicates).toBe(false);
      expect(response.body.duplicates.length).toBe(0);
    });

    it('Tenant B can create a patient with the same name without issue', async () => {
      // Create "Jean Dupont" in Tenant B directly via repository since POST /patients
      // returns { patient, redirectUrl } and involves WhatsApp service
      await patientRepository.save(
        patientRepository.create({
          clinicId: tenantB.id,
          mrn: 'MRN-DUP-B-001',
          firstName: 'Jean',
          lastName: 'Dupont',
          dob: new Date('1990-01-15'),
          gender: Gender.MALE,
          phone: '555-DUP2',
        }),
      );
    });

    it('After creating in B, Tenant B sees its own duplicate', async () => {
      const response = await request(app.getHttpServer())
        .get('/patients/check-duplicate')
        .query({ firstName: 'Jean', lastName: 'Dupont' })
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(200);

      expect(response.body.hasDuplicates).toBe(true);
      // Should only see the one from Tenant B
      response.body.duplicates.forEach((dup: any) => {
        expect(dup.clinicId).toBe(tenantB.id);
      });
    });
  });
});
