import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { InvoicingService, PaymentsService } from '../services';
import { InvoicesController, PaymentsController, TariffsController } from '../controllers';
import { Invoice, InvoiceLine, Payment, InvoiceStatus, PaymentMethod } from '../entities';
import { Repository } from 'typeorm';
import { BillingModule } from '../billing.module';
import { AuthModule } from '../../auth/auth.module';
import { PatientsModule } from '../../patients/patients.module';
import { SchedulingModule } from '../../scheduling/scheduling.module';
import { TypeOrmModule } from '@nestjs/typeorm';

// Set env vars for SQLite + JWT before imports resolve
process.env.DATABASE_TYPE = 'sqlite';
process.env.DATABASE_MEMORY = 'true';
process.env.JWT_ACCESS_SECRET = 'test_access_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';
process.env.RABBITMQ_URL = 'amqp://localhost:5672';

jest.setTimeout(30000);

// Skip: replaced by test/billing-flow.e2e-spec.ts which uses full AppModule setup
describe.skip('Billing Flow (e2e) [LEGACY]', () => {
  let app: INestApplication;
  let invoiceRepository: Repository<Invoice>;
  let invoiceLineRepository: Repository<InvoiceLine>;
  let paymentRepository: Repository<Payment>;
  let jwtService: JwtService;
  let token: string;

  const tenantId = '00000000-0000-0000-0000-000000000001';
  const patientId = '00000000-0000-0000-0000-000000000002';
  let invoiceId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          autoLoadEntities: true,
        }),
        TypeOrmModule.forFeature([Invoice, InvoiceLine, Payment]),
        EventEmitterModule.forRoot(),
        AuthModule,
        PatientsModule,
        SchedulingModule,
        BillingModule,
      ],
      providers: [],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    invoiceRepository = moduleFixture.get<Repository<Invoice>>(getRepositoryToken(Invoice));
    invoiceLineRepository = moduleFixture.get<Repository<InvoiceLine>>(getRepositoryToken(InvoiceLine));
    paymentRepository = moduleFixture.get<Repository<Payment>>(getRepositoryToken(Payment));
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Créer un token JWT pour l'authentification
    token = jwtService.sign({
      userId: '00000000-0000-0000-0000-000000000003',
      tenantId,
      roles: ['ADMIN'],
    });
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should create a draft invoice', async () => {
    const response = await request(app.getHttpServer())
      .post('/invoices')
      .set('Authorization', `Bearer ${token}`)
      .send({
        patientId,
        number: 'INV-E2E-001',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.status).toBe(InvoiceStatus.DRAFT);
    expect(response.body.patientId).toBe(patientId);
    expect(response.body.number).toBe('INV-E2E-001');

    invoiceId = response.body.id;
  });

  it('should add a line to the invoice', async () => {
    const response = await request(app.getHttpServer())
      .post('/invoices/line')
      .set('Authorization', `Bearer ${token}`)
      .send({
        invoiceId,
        description: 'Consultation générale',
        qty: 1,
        unitPrice: 120,
        thirdPartyRate: 70,
        tax: 0,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.id).toBe(invoiceId);
    expect(response.body).toHaveProperty('lines');
    expect(response.body.lines).toHaveLength(1);
    expect(response.body.total).toBe(36); // 120 - (120 * 0.7) = 36
  });

  it('should send the invoice', async () => {
    const response = await request(app.getHttpServer())
      .post('/invoices/send')
      .set('Authorization', `Bearer ${token}`)
      .send({
        invoiceId,
        status: InvoiceStatus.SENT,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.id).toBe(invoiceId);
    expect(response.body.status).toBe(InvoiceStatus.SENT);
  });

  it('should record a payment for the invoice', async () => {
    const response = await request(app.getHttpServer())
      .post('/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        invoiceId,
        amount: 36,
        method: PaymentMethod.CASH,
        reference: 'PAYMENT-E2E-001',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.invoiceId).toBe(invoiceId);
    expect(response.body.amount).toBe(36);
    expect(response.body.method).toBe(PaymentMethod.CASH);

    // Vérifier que la facture est marquée comme payée
    const invoice = await invoiceRepository.findOne({
      where: { id: invoiceId },
    });
    
    expect(invoice).not.toBeNull();
    if (invoice) {
      expect(invoice.status).toBe(InvoiceStatus.PAID);
    }
  });
}); 