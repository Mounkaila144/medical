import './setup-env'; // Importer la configuration avant tout
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Utiliser le module de test dédié
import { PatientsTestModule } from './patients-test.module';

// Utiliser nos entités mock pour les tests
import { Patient, Gender } from './mocks/entities/patient.entity';
import { User, AuthUserRole } from './mocks/entities/user.entity';
import { Tenant } from './mocks/entities/tenant.entity';
import { PatientsMockService } from './patients-mock.service';
import { PatientsService } from '../src/patients/services/patients.service';

// Augmenter le timeout pour Jest
jest.setTimeout(30000);

describe('Patients Module (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let patientRepository: Repository<Patient>;
  let userRepository: Repository<User>;
  let tenantRepository: Repository<Tenant>;
  let patientsService: PatientsService;
  
  let adminToken: string;
  let employeeToken: string;
  let adminUser: User;
  let employeeUser: User;
  let tenant: Tenant;
  let patientId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PatientsTestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ 
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      skipMissingProperties: true,
    }));
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    patientsService = moduleFixture.get<PatientsService>(PatientsService);
    patientRepository = moduleFixture.get<Repository<Patient>>(getRepositoryToken(Patient));
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    tenantRepository = moduleFixture.get<Repository<Tenant>>(getRepositoryToken(Tenant));

    // Créer un tenant pour les tests
    tenant = await tenantRepository.save({
      name: 'Clinique de Test',
      subdomain: 'test-clinic',
      isActive: true,
    });

    // Créer un utilisateur administrateur de clinique
    adminUser = await userRepository.save({
      email: 'admin@test.com',
      passwordHash: '$2b$10$5eE1Q3eP4Hy5XRh5AxEDR.6vo2sgmlKk5CIJc.nsxwrnt1RQET2TO', // "password123"
      firstName: 'Admin',
      lastName: 'Test',
      role: AuthUserRole.CLINIC_ADMIN,
      isActive: true,
      tenantId: tenant.id,
    });

    // Créer un utilisateur employé
    employeeUser = await userRepository.save({
      email: 'employee@test.com',
      passwordHash: '$2b$10$5eE1Q3eP4Hy5XRh5AxEDR.6vo2sgmlKk5CIJc.nsxwrnt1RQET2TO', // "password123"
      firstName: 'Employee',
      lastName: 'Test',
      role: AuthUserRole.EMPLOYEE,
      isActive: true,
      tenantId: tenant.id,
    });

    // Générer des tokens JWT pour les tests
    adminToken = jwtService.sign({
      sub: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      tenantId: tenant.id
    });

    employeeToken = jwtService.sign({
      sub: employeeUser.id,
      email: employeeUser.email,
      role: employeeUser.role,
      tenantId: tenant.id
    });
  });

  afterAll(async () => {
    // Nettoyer la base de données après les tests
    await app.close();
  });

  describe('CRUD des patients avec autorisation', () => {
    it('devrait créer un patient (accès EMPLOYEE)', async () => {
      const response = await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          mrn: 'MRN123',
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean.dupont@example.com',
          dob: '1980-01-01',
          gender: 'M',
          phone: '+33612345678',
          address: { street: '123 Rue Test', city: 'Paris', postalCode: '75000' }
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.firstName).toBe('Jean');
      expect(response.body.clinicId).toBe(tenant.id);

      patientId = response.body.id;

      // Ajouter un patient directement via le service pour les tests suivants
      if (!patientId) {
        const createDto = {
          mrn: 'MRN456',
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean.dupont@example.com',
          dob: new Date('1980-01-01'),
          gender: Gender.MALE,
          phone: '+33612345678',
          address: { street: '123 Rue Test', city: 'Paris', postalCode: '75000' },
          clinicId: tenant.id
        };
        const patient = await patientsService.create(createDto, tenant.id);
        patientId = patient.id;
      }
    });

    it('devrait refuser la création d\'un patient sans authentification', async () => {
      const response = await request(app.getHttpServer())
        .post('/patients')
        .send({
          mrn: 'MRN789',
          firstName: 'Alice',
          lastName: 'Martin',
          email: 'alice.martin@example.com',
          dob: '1985-03-15',
          gender: 'F',
          phone: '+33687654321',
          address: { street: '456 Rue Test', city: 'Lyon', postalCode: '69000' }
        });

      expect(response.status).toBe(401);
    });

    it('devrait récupérer tous les patients (accès EMPLOYEE)', async () => {
      // Ajouter un patient directement via le service pour s'assurer qu'il y en a au moins un
      const createDto = {
        mrn: 'MRN456',
        firstName: 'Pierre',
        lastName: 'Martin',
        email: 'pierre.martin@example.com',
        dob: new Date('1975-05-15'),
        gender: Gender.MALE,
        phone: '+33612345678',
        address: { street: '123 Rue Test', city: 'Paris', postalCode: '75000' },
        clinicId: tenant.id
      };
      await patientsService.create(createDto, tenant.id);

      const response = await request(app.getHttpServer())
        .get('/patients')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].clinicId).toBe(tenant.id);
    });

    it('devrait récupérer un patient par ID (accès EMPLOYEE)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/patients/${patientId}`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(patientId);
      expect(response.body.firstName).toBe('Jean');
    });

    it('devrait mettre à jour un patient (accès EMPLOYEE)', async () => {
      const response = await request(app.getHttpServer())
        .put(`/patients/${patientId}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          firstName: 'Jean-Pierre',
          phone: '+33612345679',
        });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(patientId);
      expect(response.body.firstName).toBe('Jean-Pierre');
      expect(response.body.phone).toBe('+33612345679');
    });

    it('devrait refuser la suppression d\'un patient par un EMPLOYEE', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/patients/${patientId}`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });

    it('devrait autoriser la suppression d\'un patient par un ADMIN', async () => {
      // Créer un nouveau patient pour ce test spécifique
      const createDto = {
        mrn: 'MRN789',
        firstName: 'Paul',
        lastName: 'Dubois',
        email: 'paul.dubois@example.com',
        dob: new Date('1990-05-15'),
        gender: Gender.MALE,
        phone: '+33612345680',
        address: { street: '123 Rue Test', city: 'Paris', postalCode: '75000' },
        clinicId: tenant.id
      };
      const newPatient = await patientsService.create(createDto, tenant.id);

      const response = await request(app.getHttpServer())
        .delete(`/patients/${newPatient.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('Contrôle d\'isolation des données multi-tenant', () => {
    let tenant2: Tenant;
    let adminUser2: User;
    let admin2Token: string;
    let patientTenant1Id: string;
    let patientTenant2Id: string;

    beforeAll(async () => {
      // Créer un second tenant et un administrateur
      tenant2 = await tenantRepository.save({
        name: 'Clinique de Test 2',
        subdomain: 'test-clinic-2',
        isActive: true,
      });

      adminUser2 = await userRepository.save({
        email: 'admin2@test.com',
        passwordHash: '$2b$10$5eE1Q3eP4Hy5XRh5AxEDR.6vo2sgmlKk5CIJc.nsxwrnt1RQET2TO',
        firstName: 'Admin',
        lastName: 'Test2',
        role: AuthUserRole.CLINIC_ADMIN,
        isActive: true,
        tenantId: tenant2.id,
      });

      admin2Token = jwtService.sign({
        sub: adminUser2.id,
        email: adminUser2.email,
        role: adminUser2.role,
        tenantId: tenant2.id
      });

      // Créer un patient pour chaque tenant
      const createDto1 = {
        mrn: 'MRN123T1',
        firstName: 'Paul',
        lastName: 'Dupont',
        email: 'paul@example.com',
        dob: new Date(),
        gender: Gender.MALE,
        address: { street: '123 Rue Test', city: 'Paris' },
        clinicId: tenant.id
      };
      const patient1 = await patientsService.create(createDto1, tenant.id);
      patientTenant1Id = patient1.id;

      const createDto2 = {
        mrn: 'MRN123T2',
        firstName: 'Pierre',
        lastName: 'Martin',
        email: 'pierre@example.com',
        dob: new Date(),
        gender: Gender.MALE,
        address: { street: '456 Rue Test', city: 'Lyon' },
        clinicId: tenant2.id
      };
      const patient2 = await patientsService.create(createDto2, tenant2.id);
      patientTenant2Id = patient2.id;
    });

    it('devrait empêcher l\'accès aux patients d\'un autre tenant', async () => {
      // L'admin du tenant1 essaie d'accéder à un patient du tenant2
      const response = await request(app.getHttpServer())
        .get(`/patients/${patientTenant2Id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    it('devrait limiter les résultats aux patients du tenant de l\'utilisateur', async () => {
      // L'admin du tenant2 récupère tous les patients
      const response = await request(app.getHttpServer())
        .get('/patients')
        .set('Authorization', `Bearer ${admin2Token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      
      // Vérifier que tous les patients retournés appartiennent au tenant2
      response.body.forEach(patient => {
        expect(patient.clinicId).toBe(tenant2.id);
      });
      
      // Vérifier que le patient du tenant1 n'est pas inclus
      const patientIds = response.body.map(p => p.id);
      expect(patientIds).not.toContain(patientTenant1Id);
    });
  });
}); 