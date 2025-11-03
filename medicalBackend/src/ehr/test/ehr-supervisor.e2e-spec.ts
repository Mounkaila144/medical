import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../../app.module';
import { Encounter } from '../entities/encounter.entity';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../common/enums/user-role.enum';

describe('EHR Supervisor Guard (e2e)', () => {
  let app: INestApplication;
  let encountersRepository: Repository<Encounter>;
  let jwtService: JwtService;
  
  // IDs de test
  const tenantId = '11111111-1111-1111-1111-111111111111';
  const patientId = '22222222-2222-2222-2222-222222222222';
  const practitionerId = '33333333-3333-3333-3333-333333333333';
  const doctorId = '44444444-4444-4444-4444-444444444444';
  const supervisorId = '55555555-5555-5555-5555-555555555555';
  
  // Tokens JWT pour les tests
  let doctorToken: string;
  let supervisorToken: string;
  
  // Données de test
  let testEncounter: Encounter;
  
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    encountersRepository = moduleFixture.get<Repository<Encounter>>(getRepositoryToken(Encounter));
    jwtService = moduleFixture.get<JwtService>(JwtService);
    
    // Générer les tokens JWT pour les utilisateurs de test
    doctorToken = jwtService.sign({
      id: doctorId,
      email: 'doctor@example.com',
      tenantId,
      roles: [UserRole.DOCTOR],
    });
    
    supervisorToken = jwtService.sign({
      id: supervisorId,
      email: 'supervisor@example.com',
      tenantId,
      roles: [UserRole.SUPERVISOR],
    });
    
    // Supprimer toutes les données de test existantes
    await encountersRepository.delete({});
    
    // Créer une consultation de test
    testEncounter = encountersRepository.create({
      tenantId,
      patientId,
      practitionerId,
      startAt: new Date(),
      motive: 'Test pour la garde EHRSupervisor',
      exam: 'Examen initial',
      diagnosis: 'Diagnostic initial',
      locked: false,
    });
    
    testEncounter = await encountersRepository.save(testEncounter);
  });
  
  afterAll(async () => {
    // Nettoyer la base de données
    await encountersRepository.delete({});
    await app.close();
  });
  
  it('un médecin peut créer une consultation', async () => {
    const createEncounterDto = {
      patientId,
      practitionerId,
      startAt: new Date().toISOString(),
      motive: 'Nouvelle consultation',
    };
    
    const response = await request(app.getHttpServer())
      .post('/encounters')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(createEncounterDto)
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
    expect(response.body.motive).toBe('Nouvelle consultation');
    expect(response.body.locked).toBe(false);
  });
  
  it('un médecin peut mettre à jour une consultation non verrouillée', async () => {
    const updateEncounterDto = {
      id: testEncounter.id,
      diagnosis: 'Diagnostic mis à jour par un médecin',
    };
    
    const response = await request(app.getHttpServer())
      .patch('/encounters')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(updateEncounterDto)
      .expect(200);
    
    expect(response.body.diagnosis).toBe('Diagnostic mis à jour par un médecin');
  });
  
  it('un médecin peut verrouiller une consultation', async () => {
    const lockEncounterDto = {
      id: testEncounter.id,
    };
    
    const response = await request(app.getHttpServer())
      .post('/encounters/lock')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(lockEncounterDto)
      .expect(201);
    
    expect(response.body.locked).toBe(true);
    
    // Mettre à jour notre objet de test pour refléter le verrouillage
    testEncounter = response.body;
  });
  
  it('un médecin ne peut pas mettre à jour une consultation verrouillée', async () => {
    const updateEncounterDto = {
      id: testEncounter.id,
      diagnosis: 'Tentative de modification après verrouillage',
    };
    
    await request(app.getHttpServer())
      .patch('/encounters')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(updateEncounterDto)
      .expect(403);
  });
  
  it('un superviseur peut mettre à jour une consultation verrouillée', async () => {
    const updateEncounterDto = {
      id: testEncounter.id,
      diagnosis: 'Diagnostic corrigé par un superviseur',
    };
    
    const response = await request(app.getHttpServer())
      .patch('/encounters')
      .set('Authorization', `Bearer ${supervisorToken}`)
      .send(updateEncounterDto)
      .expect(200);
    
    expect(response.body.diagnosis).toBe('Diagnostic corrigé par un superviseur');
    expect(response.body.locked).toBe(true); // La consultation reste verrouillée
  });
}); 