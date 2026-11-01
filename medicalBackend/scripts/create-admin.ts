// Crée (si absent) le SUPERADMIN via les services NestJS (fonctionne avec MySQL/Postgres selon .env).
// Usage (depuis medicalBackend/) : npx ts-node -r tsconfig-paths/register scripts/create-admin.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/auth/services/users.service';
import { AuthUserRole } from '../src/auth/entities/user.entity';

async function createAdmin() {
  console.log('🚀 Initialisation de l\'application...');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const usersService = app.get(UsersService);
    
    const adminEmail = 'mounkaila144@gmail.com';
    const adminPassword = 'mounkaila144';
    
    console.log(`👤 Vérification de l'existence de ${adminEmail}...`);
    
    // Vérifier si l'utilisateur existe déjà
    try {
      const existingUser = await usersService.findByEmail(adminEmail);
      if (existingUser) {
        console.log('⚠️ L\'utilisateur existe déjà. Mise à jour...');
        // Vous pouvez ajouter la logique de mise à jour ici si nécessaire
        console.log('✅ Utilisateur existant trouvé:');
        console.log(`   Email: ${existingUser.email}`);
        console.log(`   Rôle: ${existingUser.role}`);
        console.log(`   Nom: ${existingUser.firstName} ${existingUser.lastName}`);
        await app.close();
        return;
      }
    } catch (error) {
      console.log('ℹ️ Utilisateur n\'existe pas, création en cours...');
    }

    // Créer le super administrateur
    console.log('➕ Création du super administrateur...');
    const user = await usersService.createByRole({
      email: adminEmail,
      password: adminPassword,
      firstName: 'Mounkaila',
      lastName: 'Admin',
      role: AuthUserRole.SUPERADMIN
    });

    console.log('🎉 Superadmin créé avec succès!');
    console.log('🔑 Identifiants de connexion:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Mot de passe: ${adminPassword}`);
    console.log(`   Rôle: ${user.role}`);
    console.log(`   ID: ${user.id}`);
    
    // Test de connexion
    console.log('\n🧪 Test de validation...');
    try {
      const testUser = await usersService.findByEmail(adminEmail);
      if (testUser) {
        console.log('✅ Validation réussie - L\'utilisateur est bien créé');
        console.log(`   Actif: ${testUser.isActive}`);
        console.log(`   Tenant ID: ${testUser.tenantId}`);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la validation:', error.message);
    }

  } catch (error) {
    console.error('❌ Erreur lors de la création du superadmin:', error.message);
    console.error('Détails:', error);
  }

  await app.close();
}

// Vérifier si on exécute ce script directement
if (require.main === module) {
  createAdmin().catch(error => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
}

export { createAdmin }; 