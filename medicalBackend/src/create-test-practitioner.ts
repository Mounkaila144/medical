import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PractitionersService } from './scheduling/services/practitioners.service';
import { Repository } from 'typeorm';
import { Tenant } from './auth/entities/tenant.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DayOfWeek, Speciality } from './scheduling/dto/create-practitioner.dto';

async function createTestPractitioner() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const practitionersService = app.get(PractitionersService);
  const tenantRepository = app.get<Repository<Tenant>>(getRepositoryToken(Tenant));

  try {
    // Récupérer le premier tenant disponible
    const tenants = await tenantRepository.find({ take: 1 });
    let tenant = tenants[0] || null;

    if (!tenant) {
      console.log('Aucun tenant trouvé, création d\'un tenant par défaut...');
      tenant = tenantRepository.create({
        name: 'Clinique par défaut',
        slug: 'default',
        isActive: true,
      });
      tenant = await tenantRepository.save(tenant);
      console.log(`✅ Tenant créé: ${tenant.name} (ID: ${tenant.id})`);
    } else {
      console.log(`📋 Utilisation du tenant existant: ${tenant.name} (ID: ${tenant.id})`);
    }

    // Créer un praticien de test
    // Note: Le service create() crée automatiquement l'utilisateur et le lie au praticien
    const { practitioner, temporaryPassword } = await practitionersService.create(tenant.id, {
      firstName: 'Dr. Sarah',
      lastName: 'Johnson',
      speciality: Speciality.CARDIOLOGY,
      email: 'sarah.johnson@clinic.com',
      phoneNumber: '+1234567890',
      workingHours: [
        {
          dayOfWeek: DayOfWeek.MONDAY,
          slots: [{ start: '09:00', end: '17:00' }]
        },
        {
          dayOfWeek: DayOfWeek.TUESDAY,
          slots: [{ start: '09:00', end: '17:00' }]
        },
        {
          dayOfWeek: DayOfWeek.WEDNESDAY,
          slots: [{ start: '09:00', end: '17:00' }]
        },
        {
          dayOfWeek: DayOfWeek.THURSDAY,
          slots: [{ start: '09:00', end: '17:00' }]
        },
        {
          dayOfWeek: DayOfWeek.FRIDAY,
          slots: [{ start: '09:00', end: '17:00' }]
        }
      ],
      slotDuration: 30,
      color: '#FF5733'
    });

    console.log(`✅ Praticien créé: ${practitioner.firstName} ${practitioner.lastName} (ID: ${practitioner.id})`);
    console.log(`✅ Utilisateur automatiquement créé et lié au praticien`);

    console.log('\n🎉 Praticien de test créé avec succès !');
    console.log(`📧 Email: ${practitioner.email}`);
    console.log(`🔑 Mot de passe temporaire: ${temporaryPassword}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await app.close();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  createTestPractitioner()
    .then(() => {
      console.log('Script terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erreur lors de l\'exécution:', error);
      process.exit(1);
    });
} 