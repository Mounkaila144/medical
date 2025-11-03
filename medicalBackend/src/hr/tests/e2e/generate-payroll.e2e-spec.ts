import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from '../mocks/entities/staff.entity';
import { Timesheet } from '../mocks/entities/timesheet.entity';
import { PayrollExport } from '../mocks/entities/payroll-export.entity';
import { StaffRole } from '../mocks/entities/staff.entity';
import { HrTestModule } from '../hr-test.module';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

describe('Generate Payroll (e2e)', () => {
  let app: INestApplication;
  let staffRepository: Repository<Staff>;
  let timesheetRepository: Repository<Timesheet>;
  let payrollExportRepository: Repository<PayrollExport>;
  let jwtService: JwtService;
  let testStaff: Staff;
  let testTimesheet: Timesheet;
  let exportedPayrollId: string;
  const testTenantId = '00000000-0000-0000-0000-000000000000'; // UUID fixe pour les tests

  beforeAll(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [HrTestModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      staffRepository = moduleFixture.get(getRepositoryToken(Staff));
      timesheetRepository = moduleFixture.get(getRepositoryToken(Timesheet));
      payrollExportRepository = moduleFixture.get(getRepositoryToken(PayrollExport));
      jwtService = moduleFixture.get(JwtService);

      // Créer un répertoire d'exports si nécessaire
      const exportDir = path.join(process.cwd(), 'exports', 'payroll', testTenantId);
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      // Créer un membre du personnel pour les tests
      testStaff = staffRepository.create({
        firstName: 'Test',
        lastName: 'Employee',
        tenantId: testTenantId,
        role: StaffRole.NURSE,
        hireDate: new Date('2023-01-01'),
        salary: 3000
      });
      
      await staffRepository.save(testStaff);
      console.log('Membre du personnel créé avec l\'ID:', testStaff.id);

      // Créer une feuille de temps pour les tests
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // getMonth est indexé à partir de 0
      const currentYear = currentDate.getFullYear();
      
      testTimesheet = timesheetRepository.create({
        staffId: testStaff.id,
        month: currentMonth,
        year: currentYear,
        hours: 160,
        approved: true
      });
      
      await timesheetRepository.save(testTimesheet);
      console.log(`Feuille de temps créée pour ${currentMonth}/${currentYear}`);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des tests:', error);
      throw error;
    }
  }, 30000); // Augmenter le timeout à 30 secondes

  afterAll(async () => {
    try {
      // Nettoyage
      if (timesheetRepository && testTimesheet?.id) {
        await timesheetRepository.delete({ id: testTimesheet.id });
      }
      if (payrollExportRepository && exportedPayrollId) {
        await payrollExportRepository.delete({ id: exportedPayrollId });
      }
      if (staffRepository && testStaff?.id) {
        await staffRepository.delete({ id: testStaff.id });
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

  it('should generate a payroll CSV file', async () => {
    // Créer un token JWT pour l'authentification
    const token = jwtService.sign({
      id: uuidv4(),
      email: 'admin@example.com',
      tenantId: testTenantId,
      roles: ['ADMIN']
    });

    const currentDate = new Date();
    const period = `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`;

    const generatePayrollMutation = `
      mutation {
        generatePayrollCsv(createPayrollExportInput: {
          tenantId: "${testTenantId}",
          period: "${period}"
        }) {
          id
          tenantId
          period
          filePath
          generatedAt
        }
      }
    `;

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: generatePayrollMutation,
      })
      .expect(200);

    const payrollExport = response.body.data.generatePayrollCsv;
    expect(payrollExport).toBeDefined();
    expect(payrollExport.tenantId).toBe(testTenantId);
    expect(payrollExport.period).toBe(period);
    expect(payrollExport.filePath).toContain(`payroll_${period.replace('/', '-')}`);
    
    // Sauvegarder l'ID pour le nettoyage
    exportedPayrollId = payrollExport.id;
    
    // Vérifier que le fichier a été créé
    const filePath = path.join(process.cwd(), payrollExport.filePath);
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('should list all payroll exports for a tenant', async () => {
    // Créer un token JWT pour l'authentification
    const token = jwtService.sign({
      id: uuidv4(),
      email: 'admin@example.com',
      tenantId: testTenantId,
      roles: ['ADMIN']
    });

    const payrollExportsQuery = `
      query {
        payrollExportsByTenant(tenantId: "${testTenantId}") {
          id
          tenantId
          period
          filePath
          generatedAt
        }
      }
    `;

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: payrollExportsQuery,
      })
      .expect(200);

    const payrollExports = response.body.data.payrollExportsByTenant;
    expect(Array.isArray(payrollExports)).toBe(true);
    expect(payrollExports.length).toBeGreaterThanOrEqual(1);
    
    // Vérifier que notre export est dans la liste
    const currentDate = new Date();
    const period = `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`;
    
    const foundExport = payrollExports.find(exp => exp.period === period);
    expect(foundExport).toBeDefined();
    expect(foundExport.tenantId).toBe(testTenantId);
  });
}); 