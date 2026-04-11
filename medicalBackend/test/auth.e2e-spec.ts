import './setup-env';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { User, AuthUserRole } from '../src/auth/entities/user.entity';
import { Tenant } from '../src/auth/entities/tenant.entity';
import { Session } from '../src/auth/entities/session.entity';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { AuthTestModule } from './auth-test.module';
import * as bcrypt from 'bcrypt';
import { getRepositoryToken } from '@nestjs/typeorm';

jest.setTimeout(30000);

describe('Authentication Flow (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let tenantRepository: Repository<Tenant>;
  let sessionRepository: Repository<Session>;

  // Tokens
  let superadminToken: string;
  let superadminRefreshToken: string;
  let clinicAdminToken: string;
  let employeeToken: string;

  // IDs
  let tenantId: string;
  let superadminId: string;
  let clinicAdminId: string;
  let employeeId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthTestModule],
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
    sessionRepository = moduleFixture.get<Repository<Session>>(getRepositoryToken(Session));

    // Create superadmin directly in DB
    const passwordHash = await bcrypt.hash('password123', 10);
    const superadmin = userRepository.create({
      email: 'superadmin@example.com',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: AuthUserRole.SUPERADMIN,
      isActive: true,
    });
    const savedSuperadmin = await userRepository.save(superadmin);
    superadminId = savedSuperadmin.id;
  });

  afterAll(async () => {
    await app.close();
  });

  // ===== LOGIN TESTS =====

  describe('POST /auth/login', () => {
    it('should login with valid credentials and return tokens + user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'superadmin@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('superadmin@example.com');
      expect(response.body.user.role).toBe(AuthUserRole.SUPERADMIN);
      expect(response.body.user.id).toBeDefined();
      // passwordHash must NOT be in the response
      expect(response.body.user.passwordHash).toBeUndefined();

      superadminToken = response.body.accessToken;
      superadminRefreshToken = response.body.refreshToken;
    });

    it('should return 401 for invalid credentials (wrong password)', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'superadmin@example.com',
          password: 'wrongpassword123',
        })
        .expect(401);
    });

    it('should return 401 for non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);
    });
  });

  // ===== REFRESH TOKEN TESTS =====

  describe('POST /auth/refresh', () => {
    it('should return new tokens with valid refresh token', async () => {
      // First login to get a fresh refresh token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'superadmin@example.com',
          password: 'password123',
        })
        .expect(200);

      const refreshToken = loginResponse.body.refreshToken;
      expect(refreshToken).toBeDefined();

      const refreshResponse = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(200);

      expect(refreshResponse.body.accessToken).toBeDefined();
      expect(refreshResponse.body.refreshToken).toBeDefined();
      // Both access and refresh tokens should be valid JWT strings
      expect(typeof refreshResponse.body.accessToken).toBe('string');
      expect(typeof refreshResponse.body.refreshToken).toBe('string');
    });

    it('should return 401 for invalid/expired refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', 'Bearer invalid-token-xyz')
        .expect(401);
    });
  });

  // ===== LOGOUT TESTS =====

  describe('POST /auth/logout', () => {
    it('should successfully logout and invalidate refresh token', async () => {
      // Login to get tokens
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'superadmin@example.com',
          password: 'password123',
        })
        .expect(200);

      const refreshToken = loginResponse.body.refreshToken;

      // Logout
      await request(app.getHttpServer())
        .post('/auth/logout')
        .send({ refreshToken })
        .expect(200);

      // Wait a bit for session cleanup
      await new Promise(resolve => setTimeout(resolve, 100));

      // Try to use the invalidated refresh token
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(401);
    });
  });

  // ===== PROFILE TESTS =====

  describe('GET /auth/profile', () => {
    it('should return user profile without passwordHash', async () => {
      // Get a fresh token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'superadmin@example.com',
          password: 'password123',
        })
        .expect(200);

      const token = loginResponse.body.accessToken;

      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.email).toBe('superadmin@example.com');
      expect(response.body.firstName).toBe('Super');
      expect(response.body.lastName).toBe('Admin');
      expect(response.body.passwordHash).toBeUndefined();
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });
  });

  describe('PATCH /auth/profile', () => {
    it('should update firstName and lastName', async () => {
      // Get a fresh token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'superadmin@example.com',
          password: 'password123',
        })
        .expect(200);

      const token = loginResponse.body.accessToken;

      const response = await request(app.getHttpServer())
        .patch('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'UpdatedFirst',
          lastName: 'UpdatedLast',
        })
        .expect(200);

      expect(response.body.firstName).toBe('UpdatedFirst');
      expect(response.body.lastName).toBe('UpdatedLast');
      expect(response.body.passwordHash).toBeUndefined();

      // Revert
      await request(app.getHttpServer())
        .patch('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'Super',
          lastName: 'Admin',
        })
        .expect(200);
    });
  });

  // ===== CHANGE PASSWORD TESTS =====

  describe('POST /auth/change-password', () => {
    it('should change password with valid current password', async () => {
      // Create a temporary user for this test
      const hash = await bcrypt.hash('oldpassword1', 10);
      const tempUser = await userRepository.save(
        userRepository.create({
          email: 'changepwd@example.com',
          passwordHash: hash,
          firstName: 'Change',
          lastName: 'Pwd',
          role: AuthUserRole.SUPERADMIN,
          isActive: true,
        }),
      );

      // Login
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'changepwd@example.com', password: 'oldpassword1' })
        .expect(200);

      const token = loginResponse.body.accessToken;

      // Change password
      const response = await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'oldpassword1',
          newPassword: 'newpassword1',
        })
        .expect(200);

      expect(response.body.message).toBeDefined();

      // Verify new password works
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'changepwd@example.com', password: 'newpassword1' })
        .expect(200);

      // Verify old password no longer works
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'changepwd@example.com', password: 'oldpassword1' })
        .expect(401);
    });

    it('should return 400 for invalid current password', async () => {
      // Login with superadmin
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'superadmin@example.com', password: 'password123' })
        .expect(200);

      const token = loginResponse.body.accessToken;

      await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'wrongcurrent1',
          newPassword: 'newpassword1',
        })
        .expect(400);
    });
  });

  // ===== TENANT CREATION AND USER MANAGEMENT =====

  describe('Tenant and user lifecycle', () => {
    it('should create a tenant with admin as superadmin', async () => {
      // Get a fresh superadmin token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'superadmin@example.com', password: 'password123' })
        .expect(200);

      superadminToken = loginResponse.body.accessToken;

      const response = await request(app.getHttpServer())
        .post('/admin/tenants')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: 'Clinique Test',
          slug: 'clinique-test',
          adminEmail: 'admin@clinique-test.com',
          adminPassword: 'password123',
          adminFirstName: 'Clinic',
          adminLastName: 'Admin',
        })
        .expect(201);

      tenantId = response.body.id;
      expect(tenantId).toBeDefined();
      expect(response.body.name).toBe('Clinique Test');
      expect(response.body.isActive).toBe(true);

      // Verify clinic admin was created
      const clinicAdmin = await userRepository.findOne({
        where: { email: 'admin@clinique-test.com' },
      });
      expect(clinicAdmin).toBeDefined();
      expect(clinicAdmin?.role).toBe(AuthUserRole.CLINIC_ADMIN);
      clinicAdminId = clinicAdmin?.id || '';
    });

    it('should login as clinic admin', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@clinique-test.com', password: 'password123' })
        .expect(200);

      clinicAdminToken = loginResponse.body.accessToken;
      expect(clinicAdminToken).toBeDefined();
      expect(loginResponse.body.user.role).toBe(AuthUserRole.CLINIC_ADMIN);
    });

    it('should create an employee as clinic admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${clinicAdminToken}`)
        .send({
          email: 'employee@clinique-test.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'Employee',
          role: AuthUserRole.EMPLOYEE,
          tenantId,
        })
        .expect(201);

      employeeId = response.body.id;
      expect(employeeId).toBeDefined();
      expect(response.body.role).toBe(AuthUserRole.EMPLOYEE);
      expect(response.body.tenantId).toBe(tenantId);
    });

    it('should login as employee', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'employee@clinique-test.com', password: 'password123' })
        .expect(200);

      employeeToken = loginResponse.body.accessToken;
      expect(employeeToken).toBeDefined();
      expect(loginResponse.body.user.role).toBe(AuthUserRole.EMPLOYEE);
    });

    it('should not allow employee to create users', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          email: 'another@clinique-test.com',
          password: 'password123',
          firstName: 'Another',
          lastName: 'User',
          role: AuthUserRole.EMPLOYEE,
          tenantId,
        })
        .expect(403);
    });

    it('should not allow login with deactivated tenant', async () => {
      // Deactivate tenant
      await request(app.getHttpServer())
        .post(`/admin/tenants/${tenantId}/deactivate`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .expect(201);

      // Verify login is blocked
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@clinique-test.com', password: 'password123' })
        .expect(401);

      // Reactivate tenant and users
      await request(app.getHttpServer())
        .post(`/admin/tenants/${tenantId}/reactivate`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .expect(201);

      // Manually reactivate users
      await userRepository.update(clinicAdminId, { isActive: true });
      await userRepository.update(employeeId, { isActive: true });
    });

    it('CLINIC_ADMIN can access /users (GET)', async () => {
      // Re-login after reactivation
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@clinique-test.com', password: 'password123' })
        .expect(200);

      clinicAdminToken = loginResponse.body.accessToken;

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${clinicAdminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
