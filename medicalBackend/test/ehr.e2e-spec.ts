import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EHRTestModule } from './ehr-test.module';
import { Encounter } from './mocks/entities/encounter.entity';
import { Patient } from './mocks/entities/patient.entity';
import { Practitioner } from './mocks/entities/practitioner.entity';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../src/common/enums/user-role.enum';
import { Gender } from './mocks/entities/patient.entity';

describe('EHR Module (e2e)', () => {
  let app: INestApplication;
  let encountersRepository: Repository<Encounter>;
  let patientRepository: Repository<Patient>;
  let practitionerRepository: Repository<Practitioner>;
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
  let testPatient: Patient;
  let testPractitioner: Practitioner;
  let testEncounter: Encounter;
  
  beforeAll(async () => {
    console.log('Démarrage du module de test...');
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [EHRTestModule],
    }).compile();

    console.log('Module de test compilé avec succès');
    
    app = moduleFixture.createNestApplication();
    await app.init();
    
    console.log('Application initialisée');
    
    try {
      // Récupérer les repositories
      encountersRepository = moduleFixture.get<Repository<Encounter>>(getRepositoryToken(Encounter));
      patientRepository = moduleFixture.get<Repository<Patient>>(getRepositoryToken(Patient));
      practitionerRepository = moduleFixture.get<Repository<Practitioner>>(getRepositoryToken(Practitioner));
      jwtService = moduleFixture.get<JwtService>(JwtService);
      
      console.log('Repositories et services récupérés');
      
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
      
      console.log('Tokens JWT générés');
      
      // Créer un patient de test
      testPatient = patientRepository.create({
        id: patientId,
        tenantId,
        firstName: 'Patient',
        lastName: 'Test',
        birthDate: new Date('1980-01-01'),
        gender: Gender.OTHER,
        phoneNumber: '123456789',
        email: 'patient@example.com',
        address: '123 Test Street'
      });
      
      testPatient = await patientRepository.save(testPatient);
      console.log('Patient de test créé avec l\'ID:', testPatient.id);
      
      // Créer un praticien de test
      testPractitioner = practitionerRepository.create({
        id: practitionerId,
        tenantId,
        firstName: 'Docteur',
        lastName: 'Test',
        specialty: 'Médecine générale',
        color: '#FF5733'
      });
      
      testPractitioner = await practitionerRepository.save(testPractitioner);
      console.log('Praticien de test créé avec l\'ID:', testPractitioner.id);
      
      // Créer une consultation de test
      testEncounter = encountersRepository.create({
        tenantId,
        patientId: testPatient.id,
        practitionerId: testPractitioner.id,
        startAt: new Date(),
        motive: 'Test pour la garde EHRSupervisor',
        exam: 'Examen initial',
        diagnosis: 'Diagnostic initial',
        locked: false,
      });
      
      testEncounter = await encountersRepository.save(testEncounter);
      console.log('Consultation de test créée avec l\'ID:', testEncounter.id);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      throw error;
    }
  }, 30000); // Augmenter le timeout à 30 secondes
  
  afterAll(async () => {
    if (app) {
      await app.close();
      console.log('Application fermée');
    }
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
  });
  
  it('un médecin peut mettre à jour une consultation', async () => {
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
    
    expect(response.body.id).toBe(testEncounter.id);
    
    // Mettre à jour la consultation de test
    const foundEncounter = await encountersRepository.findOne({ where: { id: testEncounter.id } });
    if (foundEncounter) {
      testEncounter = foundEncounter;
    }
  });
  
  it('un superviseur peut récupérer toutes les consultations', async () => {
    const response = await request(app.getHttpServer())
      .get('/encounters')
      .set('Authorization', `Bearer ${supervisorToken}`)
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });
}); 