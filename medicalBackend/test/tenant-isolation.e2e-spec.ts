import './setup-env';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { User, AuthUserRole } from '../src/auth/entities/user.entity';
import { Tenant } from '../src/auth/entities/tenant.entity';
import { Patient, Gender } from '../src/patients/entities/patient.entity';
import { Encounter } from '../src/ehr/entities/encounter.entity';
import { Practitioner } from '../src/scheduling/entities/practitioner.entity';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

jest.setTimeout(60000);

describe('Tenant Isolation (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let tenantRepository: Repository<Tenant>;
  let patientRepository: Repository<Patient>;
  let encounterRepository: Repository<Encounter>;
  let practitionerRepository: Repository<Practitioner>;

  // Tenant A
  let tenantA: Tenant;
  let userA: User;
  let tokenA: string;
  let patientA: Patient;
  let practitionerA: Practitioner;
  let encounterA: Encounter;

  // Tenant B
  let tenantB: Tenant;
  let userB: User;
  let tokenB: string;

  // SUPERADMIN
  let superadminUser: User;
  let superadminToken: string;

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
    encounterRepository = moduleFixture.get<Repository<Encounter>>(getRepositoryToken(Encounter));
    practitionerRepository = moduleFixture.get<Repository<Practitioner>>(getRepositoryToken(Practitioner));

    const passwordHash = await bcrypt.hash('password123', 10);

    // Create Tenant A
    tenantA = await tenantRepository.save(
      tenantRepository.create({ name: 'Clinique A', slug: 'clinique-a', isActive: true }),
    );

    // Create Tenant B
    tenantB = await tenantRepository.save(
      tenantRepository.create({ name: 'Clinique B', slug: 'clinique-b', isActive: true }),
    );

    // Create User for Tenant A (CLINIC_ADMIN with EMPLOYEE role for EHR access)
    userA = await userRepository.save(
      userRepository.create({
        email: 'usera@tenant-a.com',
        passwordHash,
        firstName: 'User',
        lastName: 'A',
        role: AuthUserRole.EMPLOYEE,
        tenantId: tenantA.id,
        isActive: true,
      }),
    );

    // Create User for Tenant B
    userB = await userRepository.save(
      userRepository.create({
        email: 'userb@tenant-b.com',
        passwordHash,
        firstName: 'User',
        lastName: 'B',
        role: AuthUserRole.EMPLOYEE,
        tenantId: tenantB.id,
        isActive: true,
      }),
    );

    // Create SUPERADMIN
    superadminUser = await userRepository.save(
      userRepository.create({
        email: 'superadmin@isolation-test.com',
        passwordHash,
        firstName: 'Super',
        lastName: 'Admin',
        role: AuthUserRole.SUPERADMIN,
        isActive: true,
      }),
    );

    // Create practitioner in Tenant A
    practitionerA = await practitionerRepository.save(
      practitionerRepository.create({
        tenantId: tenantA.id,
        firstName: 'Dr',
        lastName: 'Practitioner',
        specialty: 'General',
        color: '#0000FF',
        email: 'dra@example.com',
      }),
    );

    // Create patient in Tenant A
    patientA = await patientRepository.save(
      patientRepository.create({
        clinicId: tenantA.id,
        mrn: 'MRN-ISOL-001',
        firstName: 'PatientA',
        lastName: 'TenantA',
        dob: new Date('1990-01-01'),
        gender: Gender.MALE,
        phone: '555-0001',
        email: 'patienta@example.com',
      }),
    );

    // Create encounter in Tenant A
    encounterA = await encounterRepository.save(
      encounterRepository.create({
        tenantId: tenantA.id,
        patientId: patientA.id,
        practitionerId: practitionerA.id,
        startAt: new Date(),
        motive: 'Consultation test isolation',
      }),
    );

    // Login all users
    const loginA = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'usera@tenant-a.com', password: 'password123' });
    tokenA = loginA.body.accessToken;

    const loginB = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'userb@tenant-b.com', password: 'password123' });
    tokenB = loginB.body.accessToken;

    const loginSuperadmin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'superadmin@isolation-test.com', password: 'password123' });
    superadminToken = loginSuperadmin.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  // ===== ENCOUNTER ISOLATION =====

  describe('Encounter isolation', () => {
    it('User from Tenant A can access encounter in Tenant A', async () => {
      const response = await request(app.getHttpServer())
        .get(`/encounters/${encounterA.id}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(encounterA.id);
      expect(response.body.tenantId).toBe(tenantA.id);
    });

    it('User from Tenant B CANNOT access encounter in Tenant A (404)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/encounters/${encounterA.id}`)
        .set('Authorization', `Bearer ${tokenB}`);

      // Should get 404 (not found) - not 403, because user B should not even know it exists
      expect(response.status).toBe(404);
    });

    it('User from Tenant B gets empty list for encounters (no data in B)', async () => {
      const response = await request(app.getHttpServer())
        .get('/encounters')
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  // ===== PATIENT ISOLATION =====

  describe('Patient isolation', () => {
    it('User from Tenant A can access patient in Tenant A', async () => {
      const response = await request(app.getHttpServer())
        .get(`/patients/${patientA.id}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(patientA.id);
    });

    it('User from Tenant B CANNOT access patient in Tenant A (404)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/patients/${patientA.id}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(response.status).toBe(404);
    });

    it('User from Tenant B gets empty list for patients', async () => {
      const response = await request(app.getHttpServer())
        .get('/patients')
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // All patients should belong to Tenant B (none in this case)
      response.body.forEach((p: any) => {
        expect(p.clinicId).toBe(tenantB.id);
      });
      // patientA must not be in the list
      const ids = response.body.map((p: any) => p.id);
      expect(ids).not.toContain(patientA.id);
    });
  });

  // ===== SUPERADMIN CROSS-TENANT ACCESS =====

  describe('SUPERADMIN cross-tenant access', () => {
    it('SUPERADMIN can access admin tenants endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/tenants')
        .set('Authorization', `Bearer ${superadminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });
  });
});
