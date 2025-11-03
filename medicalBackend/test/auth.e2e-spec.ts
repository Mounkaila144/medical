import './setup-env'; // Importer la configuration avant tout
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Connection, Repository } from 'typeorm';
import { User, AuthUserRole } from '../src/auth/entities/user.entity';
import { Tenant } from '../src/auth/entities/tenant.entity';
import { CreateTenantDto } from '../src/auth/dto/create-tenant.dto';
import { CreateUserDto } from '../src/auth/dto/create-user.dto';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import { AuthTestModule } from './auth-test.module';

// Augmenter le timeout pour Jest
jest.setTimeout(30000);

describe('Authentication Flow (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let userRepository: Repository<User>;
  let tenantRepository: Repository<Tenant>;

  // Tokens pour les différents rôles
  let superadminToken: string;
  let clinicAdminToken: string;
  let employeeToken: string;

  // IDs
  let tenantId: string;
  let clinicAdminId: string;
  let employeeId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthTestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    connection = app.get(Connection);
    userRepository = connection.getRepository(User);
    tenantRepository = connection.getRepository(Tenant);

    // Pas besoin de synchroniser car nous utilisons SQLite en mémoire avec synchronize: true
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a superadmin', async () => {
    const superadminDto: CreateUserDto = {
      email: 'superadmin@example.com',
      password: 'password123',
      firstName: 'Super',
      lastName: 'Admin',
      role: AuthUserRole.SUPERADMIN,
    };

    // Créer un superadmin directement dans la base de données
    const passwordHash = await require('bcrypt').hash(superadminDto.password, 10);
    const superadmin = userRepository.create({
      ...superadminDto,
      passwordHash,
    });
    await userRepository.save(superadmin);

    // Vérifier que le superadmin a été créé
    const savedSuperadmin = await userRepository.findOne({ where: { email: superadminDto.email } });
    expect(savedSuperadmin).toBeDefined();
    expect(savedSuperadmin?.role).toBe(AuthUserRole.SUPERADMIN);
  });

  it('should login as superadmin', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'superadmin@example.com',
        password: 'password123',
      })
      .expect(200);

    superadminToken = loginResponse.body.accessToken;
    expect(superadminToken).toBeDefined();
    expect(loginResponse.body.user.role).toBe(AuthUserRole.SUPERADMIN);
  });

  it('should create a tenant with admin as superadmin', async () => {
    const createTenantDto: CreateTenantDto = {
      name: 'Clinique Test',
      slug: 'clinique-test',
      adminEmail: 'admin@clinique-test.com',
      adminPassword: 'password123',
      adminFirstName: 'Clinic',
      adminLastName: 'Admin',
    };

    const response = await request(app.getHttpServer())
      .post('/admin/tenants')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send(createTenantDto)
      .expect(201);

    tenantId = response.body.id;
    expect(tenantId).toBeDefined();
    expect(response.body.name).toBe(createTenantDto.name);
    expect(response.body.slug).toBe(createTenantDto.slug);
    expect(response.body.isActive).toBe(true);

    // Vérifier que l'admin a été créé
    const clinicAdmin = await userRepository.findOne({ where: { email: createTenantDto.adminEmail } });
    expect(clinicAdmin).toBeDefined();
    expect(clinicAdmin?.role).toBe(AuthUserRole.CLINIC_ADMIN);
    expect(clinicAdmin?.tenantId).toBe(tenantId);
    clinicAdminId = clinicAdmin?.id || '';
  });

  it('should login as clinic admin', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@clinique-test.com',
        password: 'password123',
      })
      .expect(200);

    clinicAdminToken = loginResponse.body.accessToken;
    expect(clinicAdminToken).toBeDefined();
    expect(loginResponse.body.user.role).toBe(AuthUserRole.CLINIC_ADMIN);
  });

  it('should create an employee as clinic admin', async () => {
    const createEmployeeDto: CreateUserDto = {
      email: 'employee@clinique-test.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'Employee',
      role: AuthUserRole.EMPLOYEE,
      tenantId: tenantId, // Ce tenantId sera écrasé par le contrôleur
    };

    const response = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${clinicAdminToken}`)
      .send(createEmployeeDto)
      .expect(201);

    employeeId = response.body.id;
    expect(employeeId).toBeDefined();
    expect(response.body.email).toBe(createEmployeeDto.email);
    expect(response.body.role).toBe(AuthUserRole.EMPLOYEE);
    expect(response.body.tenantId).toBe(tenantId);
  });

  it('should login as employee', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'employee@clinique-test.com',
        password: 'password123',
      })
      .expect(200);

    employeeToken = loginResponse.body.accessToken;
    expect(employeeToken).toBeDefined();
    expect(loginResponse.body.user.role).toBe(AuthUserRole.EMPLOYEE);
  });

  it('should not allow employee to create users', async () => {
    const createUserDto: CreateUserDto = {
      email: 'another@clinique-test.com',
      password: 'password123',
      firstName: 'Another',
      lastName: 'User',
      role: AuthUserRole.EMPLOYEE,
      tenantId: tenantId,
    };

    await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send(createUserDto)
      .expect(403); // Forbidden
  });

  it('should allow superadmin to deactivate tenant', async () => {
    await request(app.getHttpServer())
      .post(`/admin/tenants/${tenantId}/deactivate`)
      .set('Authorization', `Bearer ${superadminToken}`)
      .expect(201);

    const deactivatedTenant = await tenantRepository.findOne({ where: { id: tenantId } });
    expect(deactivatedTenant).toBeDefined();
    expect(deactivatedTenant?.isActive).toBe(false);

    // Vérifier que les utilisateurs du tenant sont également désactivés
    const clinicAdmin = await userRepository.findOne({ where: { id: clinicAdminId } });
    expect(clinicAdmin).toBeDefined();
    expect(clinicAdmin?.isActive).toBe(false);

    const employee = await userRepository.findOne({ where: { id: employeeId } });
    expect(employee).toBeDefined();
    expect(employee?.isActive).toBe(false);
  });

  it('should not allow login with deactivated account', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@clinique-test.com',
        password: 'password123',
      })
      .expect(401); // Unauthorized
  });

  it('should allow superadmin to reactivate tenant', async () => {
    await request(app.getHttpServer())
      .post(`/admin/tenants/${tenantId}/reactivate`)
      .set('Authorization', `Bearer ${superadminToken}`)
      .expect(201);

    const reactivatedTenant = await tenantRepository.findOne({ where: { id: tenantId } });
    expect(reactivatedTenant).toBeDefined();
    expect(reactivatedTenant?.isActive).toBe(true);
  });

  it('should still require manual reactivation of users after tenant reactivation', async () => {
    // Les utilisateurs restent désactivés même après la réactivation du tenant
    const clinicAdmin = await userRepository.findOne({ where: { id: clinicAdminId } });
    expect(clinicAdmin).toBeDefined();
    expect(clinicAdmin?.isActive).toBe(false);

    // Réactiver manuellement l'admin de la clinique
    await userRepository.update(clinicAdminId, { isActive: true });

    // L'admin peut maintenant se connecter
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@clinique-test.com',
        password: 'password123',
      })
      .expect(200);

    clinicAdminToken = loginResponse.body.accessToken;
    expect(clinicAdminToken).toBeDefined();
  });

  it('should allow refresh token usage', async () => {
    // D'abord, se connecter pour obtenir un refresh token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'superadmin@example.com',
        password: 'password123',
      })
      .expect(200);

    const refreshToken = loginResponse.body.refreshToken;
    expect(refreshToken).toBeDefined();

    // Utiliser le refresh token pour obtenir un nouveau access token
    const refreshResponse = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${refreshToken}`)
      .expect(200);

    expect(refreshResponse.body.accessToken).toBeDefined();
    expect(refreshResponse.body.refreshToken).toBeDefined();
  });

  it('should allow logout', async () => {
    // D'abord, se connecter
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'superadmin@example.com',
        password: 'password123',
      })
      .expect(200);

    const refreshToken = loginResponse.body.refreshToken;

    // Puis se déconnecter
    await request(app.getHttpServer())
      .post('/auth/logout')
      .send({ refreshToken })
      .expect(200);

    // Attendre un moment pour s'assurer que la session est bien détruite
    await new Promise(resolve => setTimeout(resolve, 100));

    // Vérifier que le refresh token ne fonctionne plus
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${refreshToken}`)
      .expect(401); // Unauthorized
  });
}); 