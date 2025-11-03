import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from '../mocks/entities/staff.entity';
import { LeaveRequest, LeaveStatus } from '../mocks/entities/leave-request.entity';
import { StaffRole } from '../mocks/entities/staff.entity';
import { HrTestModule } from '../hr-test.module';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

describe('Leave Approval (e2e)', () => {
  let app: INestApplication;
  let staffRepository: Repository<Staff>;
  let leaveRequestRepository: Repository<LeaveRequest>;
  let jwtService: JwtService;
  let testStaff: Staff;
  let testLeaveRequest: LeaveRequest;
  const testTenantId = '00000000-0000-0000-0000-000000000000'; // UUID fixe pour les tests

  beforeAll(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [HrTestModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      staffRepository = moduleFixture.get(getRepositoryToken(Staff));
      leaveRequestRepository = moduleFixture.get(getRepositoryToken(LeaveRequest));
      jwtService = moduleFixture.get(JwtService);

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

      // Créer une demande de congé pour les tests
      testLeaveRequest = leaveRequestRepository.create({
        staffId: testStaff.id,
        start: new Date('2023-06-01'),
        end: new Date('2023-06-05'),
        status: LeaveStatus.PENDING
      });
      
      await leaveRequestRepository.save(testLeaveRequest);
      console.log('Demande de congé créée avec l\'ID:', testLeaveRequest.id);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des tests:', error);
      throw error;
    }
  }, 30000); // Augmenter le timeout à 30 secondes

  afterAll(async () => {
    try {
      // Nettoyage
      if (leaveRequestRepository && testLeaveRequest?.id) {
        await leaveRequestRepository.delete({ id: testLeaveRequest.id });
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

  it('should approve a leave request', async () => {
    // Créer un token JWT pour l'authentification
    const token = jwtService.sign({
      id: uuidv4(),
      email: 'admin@example.com',
      tenantId: testTenantId,
      roles: ['ADMIN']
    });

    const approveLeaveRequestMutation = `
      mutation {
        approveLeaveRequest(approveLeaveRequestInput: {
          id: "${testLeaveRequest.id}",
          status: "APPROVED",
          comment: "Approved in e2e test"
        }) {
          id
          staffId
          start
          end
          status
          comment
        }
      }
    `;

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: approveLeaveRequestMutation,
      })
      .expect(200);

    const approvedLeave = response.body.data.approveLeaveRequest;
    expect(approvedLeave.id).toBe(testLeaveRequest.id);
    expect(approvedLeave.status).toBe('APPROVED');
    expect(approvedLeave.comment).toBe('Approved in e2e test');

    // Vérifier que la base de données a été mise à jour
    const dbLeaveRequest = await leaveRequestRepository.findOne({ where: { id: testLeaveRequest.id } });
    expect(dbLeaveRequest).not.toBeNull();
    if (dbLeaveRequest) {
      expect(dbLeaveRequest.status).toBe(LeaveStatus.APPROVED);
      expect(dbLeaveRequest.comment).toBe('Approved in e2e test');
    }
  });

  it('should query leave requests by staff', async () => {
    // Créer un token JWT pour l'authentification
    const token = jwtService.sign({
      id: uuidv4(),
      email: 'admin@example.com',
      tenantId: testTenantId,
      roles: ['ADMIN']
    });

    const leaveRequestsQuery = `
      query {
        leaveRequestsByStaff(staffId: "${testStaff.id}") {
          id
          staffId
          start
          end
          status
          comment
        }
      }
    `;

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: leaveRequestsQuery,
      })
      .expect(200);

    const leaveRequests = response.body.data.leaveRequestsByStaff;
    expect(Array.isArray(leaveRequests)).toBe(true);
    expect(leaveRequests.length).toBeGreaterThanOrEqual(1);

    const foundRequest = leaveRequests.find(req => req.id === testLeaveRequest.id);
    expect(foundRequest).toBeDefined();
    expect(foundRequest.status).toBe('APPROVED');
  });
}); 