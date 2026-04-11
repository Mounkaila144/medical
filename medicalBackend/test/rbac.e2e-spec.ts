import './setup-env';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { User, AuthUserRole } from '../src/auth/entities/user.entity';
import { Tenant } from '../src/auth/entities/tenant.entity';
import { Patient, Gender } from '../src/patients/entities/patient.entity';
import { Practitioner } from '../src/scheduling/entities/practitioner.entity';
import { Invoice, InvoiceStatus } from '../src/billing/entities/invoice.entity';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

jest.setTimeout(60000);

describe('RBAC - Role-Based Access Control (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let tenantRepository: Repository<Tenant>;
  let patientRepository: Repository<Patient>;
  let practitionerRepository: Repository<Practitioner>;
  let invoiceRepository: Repository<Invoice>;

  let tenant: Tenant;
  let patient: Patient;
  let practitioner: Practitioner;
  let invoiceId: string;

  // Tokens per role
  let superadminToken: string;
  let clinicAdminToken: string;
  let employeeToken: string;
  let accountantToken: string;
  let practitionerToken: string;

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
    practitionerRepository = moduleFixture.get<Repository<Practitioner>>(getRepositoryToken(Practitioner));
    invoiceRepository = moduleFixture.get<Repository<Invoice>>(getRepositoryToken(Invoice));

    const passwordHash = await bcrypt.hash('password123', 10);

    // Create tenant
    tenant = await tenantRepository.save(
      tenantRepository.create({ name: 'RBAC Test Clinic', slug: 'rbac-test', isActive: true }),
    );

    // Create users with different roles
    const createUser = async (email: string, role: AuthUserRole, tid?: string): Promise<User> => {
      const user = new User();
      user.email = email;
      user.passwordHash = passwordHash;
      user.firstName = role;
      user.lastName = 'User';
      user.role = role;
      user.isActive = true;
      if (tid) {
        user.tenantId = tid;
      }
      return userRepository.save(user);
    };

    await createUser('superadmin@rbac.com', AuthUserRole.SUPERADMIN);
    await createUser('clinicadmin@rbac.com', AuthUserRole.CLINIC_ADMIN, tenant.id);
    await createUser('employee@rbac.com', AuthUserRole.EMPLOYEE, tenant.id);
    await createUser('accountant@rbac.com', AuthUserRole.ACCOUNTANT, tenant.id);
    const practUserEntity = await createUser('practitioner@rbac.com', AuthUserRole.PRACTITIONER, tenant.id);

    // Create practitioner entity linked to user
    practitioner = await practitionerRepository.save(
      practitionerRepository.create({
        tenantId: tenant.id,
        firstName: 'Dr',
        lastName: 'RBAC',
        specialty: 'General',
        color: '#FF0000',
        email: 'practitioner@rbac.com',
        userId: practUserEntity.id,
      }),
    );

    // Create a test patient
    patient = await patientRepository.save(
      patientRepository.create({
        clinicId: tenant.id,
        mrn: 'MRN-RBAC-001',
        firstName: 'RBAC',
        lastName: 'Patient',
        dob: new Date('1985-05-15'),
        gender: Gender.MALE,
        phone: '555-RBAC',
      }),
    );

    // Create a test invoice
    const invoice = await invoiceRepository.save(
      invoiceRepository.create({
        tenantId: tenant.id,
        patientId: patient.id,
        number: `INV-RBAC-${Date.now()}`,
        status: InvoiceStatus.DRAFT,
        total: 0,
        dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        issueDate: new Date(),
      }),
    );
    invoiceId = invoice.id;

    // Login each user
    const login = async (email: string): Promise<string> => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'password123' });
      return response.body.accessToken;
    };

    superadminToken = await login('superadmin@rbac.com');
    clinicAdminToken = await login('clinicadmin@rbac.com');
    employeeToken = await login('employee@rbac.com');
    accountantToken = await login('accountant@rbac.com');
    practitionerToken = await login('practitioner@rbac.com');
  });

  afterAll(async () => {
    await app.close();
  });

  // ===== ACCOUNTANT ROLE =====

  describe('ACCOUNTANT role', () => {
    it('ACCOUNTANT can GET /invoices -> 200', async () => {
      const response = await request(app.getHttpServer())
        .get('/invoices')
        .set('Authorization', `Bearer ${accountantToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('ACCOUNTANT cannot GET /patients -> 403', async () => {
      const response = await request(app.getHttpServer())
        .get('/patients')
        .set('Authorization', `Bearer ${accountantToken}`);

      expect(response.status).toBe(403);
    });

    it('ACCOUNTANT cannot DELETE /invoices/:id -> 403', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${accountantToken}`);

      expect(response.status).toBe(403);
    });
  });

  // ===== EMPLOYEE ROLE =====

  describe('EMPLOYEE role', () => {
    it('EMPLOYEE can GET /patients -> 200', async () => {
      const response = await request(app.getHttpServer())
        .get('/patients')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('EMPLOYEE cannot POST /admin/tenants -> 403', async () => {
      const response = await request(app.getHttpServer())
        .post('/admin/tenants')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          name: 'Unauthorized Tenant',
          slug: 'unauth-tenant',
          adminEmail: 'admin@unauth.com',
          adminPassword: 'password123',
          adminFirstName: 'Admin',
          adminLastName: 'Unauth',
        });

      expect(response.status).toBe(403);
    });
  });

  // ===== PRACTITIONER ROLE =====

  describe('PRACTITIONER role', () => {
    it('PRACTITIONER can POST /encounters -> 201', async () => {
      const response = await request(app.getHttpServer())
        .post('/encounters')
        .set('Authorization', `Bearer ${practitionerToken}`)
        .send({
          patientId: patient.id,
          practitionerId: practitioner.id,
          startAt: new Date().toISOString(),
          motive: 'RBAC test encounter',
        });

      // Should be 201 (created) or 200
      expect([200, 201]).toContain(response.status);
      expect(response.body.motive).toBe('RBAC test encounter');
    });

    it('PRACTITIONER cannot DELETE /invoices/:id -> 403', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${practitionerToken}`);

      expect(response.status).toBe(403);
    });
  });

  // ===== SUPERADMIN ROLE =====

  describe('SUPERADMIN role', () => {
    it('SUPERADMIN can access /admin/tenants -> 200', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/tenants')
        .set('Authorization', `Bearer ${superadminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // ===== CLINIC_ADMIN ROLE =====

  describe('CLINIC_ADMIN role', () => {
    it('CLINIC_ADMIN can access /users (GET) -> 200', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${clinicAdminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('CLINIC_ADMIN cannot access /admin/tenants -> 403', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/tenants')
        .set('Authorization', `Bearer ${clinicAdminToken}`);

      expect(response.status).toBe(403);
    });
  });

  // ===== UNAUTHENTICATED ACCESS =====

  describe('Unauthenticated access', () => {
    it('should return 401 for protected routes without token', async () => {
      await request(app.getHttpServer())
        .get('/patients')
        .expect(401);

      await request(app.getHttpServer())
        .get('/invoices')
        .expect(401);

      await request(app.getHttpServer())
        .get('/encounters')
        .expect(401);
    });
  });
});
