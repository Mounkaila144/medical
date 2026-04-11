import './setup-env';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { User, AuthUserRole } from '../src/auth/entities/user.entity';
import { Tenant } from '../src/auth/entities/tenant.entity';
import { Patient, Gender } from '../src/patients/entities/patient.entity';
import { Practitioner } from '../src/scheduling/entities/practitioner.entity';
import { Appointment } from '../src/scheduling/entities/appointment.entity';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

jest.setTimeout(60000);

describe('Appointment Conflict Detection (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let tenantRepository: Repository<Tenant>;
  let patientRepository: Repository<Patient>;
  let practitionerRepository: Repository<Practitioner>;
  let appointmentRepository: Repository<Appointment>;

  let tenant: Tenant;
  let patient: Patient;
  let practitioner: Practitioner;
  let token: string;

  // Will store appointment IDs for reference
  let firstAppointmentId: string;

  // Fixed future date for testing to avoid timezone issues
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + 7); // 7 days from now
  baseDate.setHours(0, 0, 0, 0);

  function makeTime(hours: number, minutes: number = 0): string {
    const d = new Date(baseDate);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  }

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
    appointmentRepository = moduleFixture.get<Repository<Appointment>>(getRepositoryToken(Appointment));

    const passwordHash = await bcrypt.hash('password123', 10);

    // Create tenant
    tenant = await tenantRepository.save(
      tenantRepository.create({ name: 'Appointment Test Clinic', slug: 'appt-test', isActive: true }),
    );

    // Create user
    const user = await userRepository.save(
      userRepository.create({
        email: 'appt-user@example.com',
        passwordHash,
        firstName: 'Appt',
        lastName: 'User',
        role: AuthUserRole.EMPLOYEE,
        tenantId: tenant.id,
        isActive: true,
      }),
    );

    // Create practitioner
    practitioner = await practitionerRepository.save(
      practitionerRepository.create({
        tenantId: tenant.id,
        firstName: 'Dr',
        lastName: 'Schedule',
        specialty: 'General',
        color: '#00FF00',
        email: 'drschedule@example.com',
      }),
    );

    // Create patient
    patient = await patientRepository.save(
      patientRepository.create({
        clinicId: tenant.id,
        mrn: 'MRN-APPT-001',
        firstName: 'Appt',
        lastName: 'Patient',
        dob: new Date('1990-01-01'),
        gender: Gender.MALE,
        phone: '555-APPT',
      }),
    );

    // Login
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'appt-user@example.com', password: 'password123' });
    token = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Conflict detection', () => {
    it('should create an appointment at 10:00-11:00 successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          patientId: patient.id,
          practitionerId: practitioner.id,
          startAt: makeTime(10, 0),
          endAt: makeTime(11, 0),
          reason: 'First appointment',
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      firstAppointmentId = response.body.id;
    });

    it('should reject overlapping appointment at 10:30-11:30 (409 Conflict)', async () => {
      const response = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          patientId: patient.id,
          practitionerId: practitioner.id,
          startAt: makeTime(10, 30),
          endAt: makeTime(11, 30),
          reason: 'Overlapping appointment',
        });

      expect(response.status).toBe(409);
    });

    it('should accept non-overlapping appointment at 11:00-12:00 (201)', async () => {
      const response = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          patientId: patient.id,
          practitionerId: practitioner.id,
          startAt: makeTime(11, 0),
          endAt: makeTime(12, 0),
          reason: 'Non-overlapping appointment',
        });

      expect(response.status).toBe(201);
    });

    it('should allow overlap after first appointment is cancelled', async () => {
      // Cancel the first appointment
      const cancelResponse = await request(app.getHttpServer())
        .post(`/appointments/${firstAppointmentId}/cancel`)
        .set('Authorization', `Bearer ${token}`)
        .send({ cancellationReason: 'Testing conflict after cancel' });

      expect(cancelResponse.status).toBe(201);
      expect(cancelResponse.body.status).toBe('CANCELLED');

      // Now creating an appointment at the originally conflicting time should succeed
      const response = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          patientId: patient.id,
          practitionerId: practitioner.id,
          startAt: makeTime(10, 30),
          endAt: makeTime(11, 0), // Shortened to avoid 11-12 appointment conflict
          reason: 'After cancellation, no conflict',
        });

      expect(response.status).toBe(201);
    });

    it('should reject reschedule to overlapping time (409)', async () => {
      // Create two appointments that don't overlap
      const appt1Response = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          patientId: patient.id,
          practitionerId: practitioner.id,
          startAt: makeTime(14, 0),
          endAt: makeTime(15, 0),
          reason: 'Reschedule test 1',
        });
      expect(appt1Response.status).toBe(201);
      const appt1Id = appt1Response.body.id;

      const appt2Response = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          patientId: patient.id,
          practitionerId: practitioner.id,
          startAt: makeTime(16, 0),
          endAt: makeTime(17, 0),
          reason: 'Reschedule test 2',
        });
      expect(appt2Response.status).toBe(201);

      // Try to reschedule appt1 to overlap with appt2
      const rescheduleResponse = await request(app.getHttpServer())
        .put('/appointments/reschedule')
        .set('Authorization', `Bearer ${token}`)
        .send({
          appointmentId: appt1Id,
          startAt: makeTime(16, 0),
          endAt: makeTime(17, 0),
        });

      expect(rescheduleResponse.status).toBe(409);
    });

    it('should accept reschedule to non-overlapping time', async () => {
      // Create an appointment
      const apptResponse = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          patientId: patient.id,
          practitionerId: practitioner.id,
          startAt: makeTime(8, 0),
          endAt: makeTime(8, 30),
          reason: 'Will be rescheduled',
        });
      expect(apptResponse.status).toBe(201);
      const apptId = apptResponse.body.id;

      // Reschedule to a completely free time
      const rescheduleResponse = await request(app.getHttpServer())
        .put('/appointments/reschedule')
        .set('Authorization', `Bearer ${token}`)
        .send({
          appointmentId: apptId,
          startAt: makeTime(19, 0),
          endAt: makeTime(20, 0),
        });

      expect(rescheduleResponse.status).toBe(200);
      expect(rescheduleResponse.body.id).toBe(apptId);
    });
  });
});
