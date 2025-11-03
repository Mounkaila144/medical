import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

import { SchedulingTestModule } from './scheduling-test.module';
import { Practitioner } from './mocks/entities/practitioner.entity';
import { Appointment, AppointmentStatus } from './mocks/entities/appointment.entity';
import { WaitQueueEntry } from './mocks/entities/wait-queue-entry.entity';
import { UrgencyLevel } from './mocks/entities/appointment.entity';

describe('Scheduling Management (e2e)', () => {
  let app: INestApplication;
  let practitionerRepository: Repository<Practitioner>;
  let appointmentRepository: Repository<Appointment>;
  let waitQueueRepository: Repository<WaitQueueEntry>;
  let jwtService: JwtService;
  
  let testPractitioner: Practitioner;
  
  const testTenantId = '00000000-0000-0000-0000-000000000000';
  const testPatientId = '11111111-1111-1111-1111-111111111111';

  beforeAll(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [SchedulingTestModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      practitionerRepository = moduleFixture.get(getRepositoryToken(Practitioner));
      appointmentRepository = moduleFixture.get(getRepositoryToken(Appointment));
      waitQueueRepository = moduleFixture.get(getRepositoryToken(WaitQueueEntry));
      jwtService = moduleFixture.get(JwtService);

      // Créer un praticien pour les tests
      testPractitioner = await practitionerRepository.save({
        id: uuidv4(),
        tenantId: testTenantId,
        firstName: 'Test',
        lastName: 'Doctor',
        specialty: 'General',
        color: '#FF5733'
      });
      
      console.log('Praticien créé avec ID:', testPractitioner.id);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des tests:', error);
      throw error;
    }
  }, 30000);

  afterAll(async () => {
    try {
      // Nettoyage avec des critères spécifiques
      if (appointmentRepository) {
        // Utiliser tenantId comme critère si aucun autre critère spécifique n'est disponible
        await appointmentRepository.delete({ tenantId: testTenantId });
      }
      
      if (waitQueueRepository) {
        await waitQueueRepository.delete({ tenantId: testTenantId });
      }
      
      if (testPractitioner && testPractitioner.id && practitionerRepository) {
        await practitionerRepository.delete({ id: testPractitioner.id });
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage des tests:', error);
    } finally {
      if (app) {
        await app.close();
      }
      console.log('Tests terminés, ressources nettoyées');
    }
  });

  it('should book a new appointment', async () => {
    // Créer un token JWT pour l'authentification
    const token = jwtService.sign({
      id: uuidv4(),
      email: 'admin@example.com',
      tenantId: testTenantId,
      roles: ['ADMIN']
    });

    const startAt = new Date();
    startAt.setHours(startAt.getHours() + 1);
    
    const endAt = new Date(startAt);
    endAt.setHours(endAt.getHours() + 1);
    
    const createAppointmentDto = {
      patientId: testPatientId,
      practitionerId: testPractitioner.id,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      room: 'Room 101',
      reason: 'Check-up',
      urgency: UrgencyLevel.ROUTINE,
    };

    const response = await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send(createAppointmentDto)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.tenantId).toBe(testTenantId);
    expect(response.body.patientId).toBe(testPatientId);
    expect(response.body.practitionerId).toBe(testPractitioner.id);
    expect(response.body.status).toBe(AppointmentStatus.BOOKED);
  });

  it('should cancel an appointment', async () => {
    // Créer un token JWT pour l'authentification
    const token = jwtService.sign({
      id: uuidv4(),
      email: 'admin@example.com',
      tenantId: testTenantId,
      roles: ['ADMIN']
    });

    // Créer un rendez-vous dans la base de données
    const startAt = new Date();
    startAt.setHours(startAt.getHours() + 2);
    
    const endAt = new Date(startAt);
    endAt.setHours(endAt.getHours() + 1);
    
    const appointment = await appointmentRepository.save({
      id: uuidv4(),
      tenantId: testTenantId,
      patientId: testPatientId,
      practitionerId: testPractitioner.id,
      status: AppointmentStatus.BOOKED,
      startAt,
      endAt,
      room: 'Room 102',
      reason: 'Follow-up',
      urgency: UrgencyLevel.ROUTINE,
    });

    const response = await request(app.getHttpServer())
      .delete(`/appointments/${appointment.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body.id).toBe(appointment.id);
    expect(response.body.status).toBe(AppointmentStatus.CANCELLED);
  });

  it('should add a patient to the wait queue', async () => {
    // Créer un token JWT pour l'authentification
    const token = jwtService.sign({
      id: uuidv4(),
      email: 'admin@example.com',
      tenantId: testTenantId,
      roles: ['ADMIN']
    });

    const createWaitQueueEntryDto = {
      patientId: testPatientId,
    };

    const response = await request(app.getHttpServer())
      .post('/wait-queue/enqueue')
      .set('Authorization', `Bearer ${token}`)
      .send(createWaitQueueEntryDto)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.tenantId).toBe(testTenantId);
    expect(response.body.patientId).toBe(testPatientId);
    expect(response.body.rank).toBe(1);
    expect(response.body).toHaveProperty('createdAt');
    expect(response.body.servedAt).toBeNull();
  });

  it('should call the next patient from the queue', async () => {
    // Créer un token JWT pour l'authentification
    const token = jwtService.sign({
      id: uuidv4(),
      email: 'admin@example.com',
      tenantId: testTenantId,
      roles: ['ADMIN']
    });

    // Vérifier que le patient est dans la file d'attente
    const queueResponse = await request(app.getHttpServer())
      .get('/wait-queue')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(queueResponse.body).toHaveLength(1);
    expect(queueResponse.body[0].patientId).toBe(testPatientId);

    // Appeler le patient suivant
    const callNextResponse = await request(app.getHttpServer())
      .post('/wait-queue/call-next')
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(callNextResponse.body.patientId).toBe(testPatientId);
    expect(callNextResponse.body).toHaveProperty('servedAt');
    expect(callNextResponse.body.servedAt).not.toBeNull();

    // Vérifier que la file d'attente est vide
    const emptyQueueResponse = await request(app.getHttpServer())
      .get('/wait-queue')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(emptyQueueResponse.body).toHaveLength(0);
  });
}); 