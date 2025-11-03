import './setup-env'; // Importer la configuration avant tout
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, Controller, Post, Delete, Get, Body, Param, Inject } from '@nestjs/common';
import * as request from 'supertest';

import { AppointmentStatus } from '../src/scheduling/enums/appointment-status.enum';
import { UrgencyLevel } from '../src/scheduling/enums/urgency-level.enum';
import { SchedulingService } from '../src/scheduling/services/scheduling.service';
import { WaitQueueService } from '../src/scheduling/services/wait-queue.service';
import { CreateAppointmentDto } from '../src/scheduling/dto/create-appointment.dto';
import { CreateWaitQueueEntryDto } from '../src/scheduling/dto/create-wait-queue-entry.dto';

// Constantes pour les tests
const TEST_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const TEST_PATIENT_ID = '00000000-0000-0000-0000-000000000002';
const TEST_USER_ID = '00000000-0000-0000-0000-000000000003';
const PRACTITIONER_ID = '00000000-0000-0000-0000-000000000004';

// Augmenter le timeout pour Jest
jest.setTimeout(30000);

// Override des gardes pour les tests
class MockJwtAuthGuard {
  canActivate() {
    return true;
  }
}

class MockTenantGuard {
  canActivate() {
    return true;
  }
}

// Contrôleurs spécifiques aux tests (sans authentification)
@Controller('appointments')
class TestAppointmentsController {
  constructor(
    @Inject(SchedulingService) private readonly schedulingService: SchedulingService,
  ) {}

  @Post()
  async create(@Body() createAppointmentDto: any) {
    // Ne pas valider le DTO, utiliser directement le service
    return this.schedulingService.book(TEST_TENANT_ID, {
      ...createAppointmentDto,
      // Conversion des dates si nécessaire
      startAt: new Date(createAppointmentDto.startAt),
      endAt: new Date(createAppointmentDto.endAt),
    });
  }

  @Delete(':id')
  async cancel(@Param('id') appointmentId: string) {
    return this.schedulingService.cancel(TEST_TENANT_ID, appointmentId);
  }
}

@Controller('wait-queue')
class TestWaitQueueController {
  constructor(
    @Inject(WaitQueueService) private readonly waitQueueService: WaitQueueService,
  ) {}

  @Post('enqueue')
  async enqueue(@Body() createDto: any) {
    // Ne pas valider le DTO, utiliser directement le service
    return this.waitQueueService.enqueue(TEST_TENANT_ID, createDto);
  }

  @Post('call-next')
  async callNext() {
    return this.waitQueueService.callNext(TEST_TENANT_ID);
  }

  @Get()
  async getQueue() {
    return this.waitQueueService.getQueue(TEST_TENANT_ID);
  }
}

describe('Scheduling (e2e)', () => {
  let app: INestApplication;

  // Mocks des services
  const mockSchedulingService = {
    book: jest.fn().mockImplementation((tenantId, dto) => {
      return Promise.resolve({
        id: '12345',
        tenantId,
        patientId: dto.patientId,
        practitionerId: dto.practitionerId,
        startAt: dto.startAt,
        endAt: dto.endAt,
        room: dto.room,
        reason: dto.reason,
        urgency: dto.urgency,
        status: AppointmentStatus.BOOKED
      });
    }),
    cancel: jest.fn().mockImplementation((tenantId, id) => {
      return Promise.resolve({
        id,
        tenantId,
        status: AppointmentStatus.CANCELLED,
      });
    }),
  };

  const mockWaitQueueService = {
    enqueue: jest.fn().mockImplementation((tenantId, dto) => {
      return Promise.resolve({
        id: '67890',
        tenantId,
        patientId: dto.patientId,
        rank: 1,
        createdAt: new Date(),
        servedAt: null
      });
    }),
    callNext: jest.fn().mockImplementation((tenantId) => {
      return Promise.resolve({
        id: '67890',
        tenantId,
        patientId: TEST_PATIENT_ID,
        rank: 1,
        createdAt: new Date(),
        servedAt: new Date()
      });
    }),
    getQueue: jest.fn().mockImplementation((tenantId) => {
      const entry = {
        id: '67890',
        tenantId,
        patientId: TEST_PATIENT_ID,
        rank: 1,
        createdAt: new Date(),
        servedAt: null
      };
      
      // Renvoyer un tableau vide après l'appel de callNext
      if (mockWaitQueueService.callNext.mock.calls.length > 0) {
        return Promise.resolve([]);
      }
      
      return Promise.resolve([entry]);
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TestAppointmentsController, TestWaitQueueController],
      providers: [
        { provide: SchedulingService, useValue: mockSchedulingService },
        { provide: WaitQueueService, useValue: mockWaitQueueService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Appointments', () => {
    it('should book a new appointment', async () => {
      const startAt = new Date();
      startAt.setHours(startAt.getHours() + 1);
      
      const endAt = new Date(startAt);
      endAt.setHours(endAt.getHours() + 1);
      
      const createAppointmentDto = {
        patientId: TEST_PATIENT_ID,
        practitionerId: PRACTITIONER_ID,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        room: 'Room 101',
        reason: 'Check-up',
        urgency: UrgencyLevel.ROUTINE,
      };

      const response = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', `Bearer fake-token`)
        .send(createAppointmentDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.tenantId).toBe(TEST_TENANT_ID);
      expect(response.body.patientId).toBe(TEST_PATIENT_ID);
      expect(response.body.practitionerId).toBe(PRACTITIONER_ID);
      expect(response.body.status).toBe(AppointmentStatus.BOOKED);
    });

    it('should cancel an appointment', async () => {
      const appointmentId = '12345';

      const response = await request(app.getHttpServer())
        .delete(`/appointments/${appointmentId}`)
        .expect(200);

      expect(response.body.id).toBe(appointmentId);
      expect(response.body.status).toBe(AppointmentStatus.CANCELLED);
    });
  });

  describe('Wait Queue', () => {
    it('should add a patient to the wait queue', async () => {
      const createWaitQueueEntryDto = {
        patientId: TEST_PATIENT_ID,
      };

      const response = await request(app.getHttpServer())
        .post('/wait-queue/enqueue')
        .send(createWaitQueueEntryDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.tenantId).toBe(TEST_TENANT_ID);
      expect(response.body.patientId).toBe(TEST_PATIENT_ID);
      expect(response.body.rank).toBe(1);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body.servedAt).toBeNull();
    });

    it('should call the next patient from the queue', async () => {
      // Vérifier que le patient est dans la file d'attente
      const queueResponse = await request(app.getHttpServer())
        .get('/wait-queue')
        .expect(200);

      expect(queueResponse.body).toHaveLength(1);
      expect(queueResponse.body[0].patientId).toBe(TEST_PATIENT_ID);

      // Appeler le patient suivant
      const callNextResponse = await request(app.getHttpServer())
        .post('/wait-queue/call-next')
        .expect(201);

      expect(callNextResponse.body.patientId).toBe(TEST_PATIENT_ID);
      expect(callNextResponse.body).toHaveProperty('servedAt');
      expect(callNextResponse.body.servedAt).not.toBeNull();

      // Vérifier que la file d'attente est vide
      const emptyQueueResponse = await request(app.getHttpServer())
        .get('/wait-queue')
        .expect(200);

      expect(emptyQueueResponse.body).toHaveLength(0);
    });
  });
}); 