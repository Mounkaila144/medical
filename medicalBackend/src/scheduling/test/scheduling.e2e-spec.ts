import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppModule } from '../../app.module';
import { Appointment } from '../entities/appointment.entity';
import { Practitioner } from '../entities/practitioner.entity';
import { WaitQueueEntry } from '../entities/wait-queue-entry.entity';
import { AppointmentStatus } from '../enums/appointment-status.enum';
import { UrgencyLevel } from '../enums/urgency-level.enum';

describe('Scheduling (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let appointmentRepository: Repository<Appointment>;
  let practitionerRepository: Repository<Practitioner>;
  let waitQueueRepository: Repository<WaitQueueEntry>;
  
  const tenantId = '00000000-0000-0000-0000-000000000001';
  const patientId = '00000000-0000-0000-0000-000000000002';
  const userId = '00000000-0000-0000-0000-000000000003';
  
  let practitionerId: string;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    
    jwtService = moduleFixture.get<JwtService>(JwtService);
    appointmentRepository = moduleFixture.get<Repository<Appointment>>(
      getRepositoryToken(Appointment),
    );
    practitionerRepository = moduleFixture.get<Repository<Practitioner>>(
      getRepositoryToken(Practitioner),
    );
    waitQueueRepository = moduleFixture.get<Repository<WaitQueueEntry>>(
      getRepositoryToken(WaitQueueEntry),
    );
    
    await app.init();

    // Créer un token JWT pour l'authentification
    authToken = jwtService.sign({ 
      sub: userId,
      tenantId,
    });

    // Créer un praticien pour les tests
    const practitioner = await practitionerRepository.save({
      tenantId,
      firstName: 'John',
      lastName: 'Doe',
      specialty: 'Cardiology',
      color: '#FF5733',
    });
    
    practitionerId = practitioner.id;
  });

  afterAll(async () => {
    await appointmentRepository.delete({});
    await practitionerRepository.delete({});
    await waitQueueRepository.delete({});
    await app.close();
  });

  describe('Appointments', () => {
    it('should book a new appointment', async () => {
      const startAt = new Date();
      startAt.setHours(startAt.getHours() + 1);
      
      const endAt = new Date(startAt);
      endAt.setHours(endAt.getHours() + 1);
      
      const createAppointmentDto = {
        patientId,
        practitionerId,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        room: 'Room 101',
        reason: 'Check-up',
        urgency: UrgencyLevel.ROUTINE,
      };

      const response = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createAppointmentDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.tenantId).toBe(tenantId);
      expect(response.body.patientId).toBe(patientId);
      expect(response.body.practitionerId).toBe(practitionerId);
      expect(response.body.status).toBe(AppointmentStatus.BOOKED);
    });

    it('should cancel an appointment', async () => {
      // Créer un rendez-vous à annuler
      const startAt = new Date();
      startAt.setHours(startAt.getHours() + 2);
      
      const endAt = new Date(startAt);
      endAt.setHours(endAt.getHours() + 1);
      
      const appointment = await appointmentRepository.save({
        tenantId,
        patientId,
        practitionerId,
        status: AppointmentStatus.BOOKED,
        startAt,
        endAt,
        room: 'Room 102',
        reason: 'Follow-up',
        urgency: UrgencyLevel.ROUTINE,
      });

      const response = await request(app.getHttpServer())
        .delete(`/appointments/${appointment.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(appointment.id);
      expect(response.body.status).toBe(AppointmentStatus.CANCELLED);
    });
  });

  describe('Wait Queue', () => {
    it('should add a patient to the wait queue', async () => {
      const createWaitQueueEntryDto = {
        patientId,
      };

      const response = await request(app.getHttpServer())
        .post('/wait-queue/enqueue')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createWaitQueueEntryDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.tenantId).toBe(tenantId);
      expect(response.body.patientId).toBe(patientId);
      expect(response.body.rank).toBe(1);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body.servedAt).toBeNull();
    });

    it('should call the next patient from the queue', async () => {
      // Vérifier que le patient est dans la file d'attente
      const queueResponse = await request(app.getHttpServer())
        .get('/wait-queue')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(queueResponse.body).toHaveLength(1);
      expect(queueResponse.body[0].patientId).toBe(patientId);

      // Appeler le patient suivant
      const callNextResponse = await request(app.getHttpServer())
        .post('/wait-queue/call-next')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(callNextResponse.body.patientId).toBe(patientId);
      expect(callNextResponse.body).toHaveProperty('servedAt');
      expect(callNextResponse.body.servedAt).not.toBeNull();

      // Vérifier que la file d'attente est vide
      const emptyQueueResponse = await request(app.getHttpServer())
        .get('/wait-queue')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(emptyQueueResponse.body).toHaveLength(0);
    });
  });
}); 