"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdmin = createAdmin;
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const users_service_1 = require("./src/auth/services/users.service");
const user_entity_1 = require("./src/auth/entities/user.entity");
async function createAdmin() {
    console.log('🚀 Initialisation de l\'application...');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    try {
        const usersService = app.get(users_service_1.UsersService);
        const adminEmail = 'mounkaila144@gmail.com';
        const adminPassword = 'mounkaila144';
        console.log(`👤 Vérification de l'existence de ${adminEmail}...`);
        try {
            const existingUser = await usersService.findByEmail(adminEmail);
            if (existingUser) {
                console.log('⚠️ L\'utilisateur existe déjà. Mise à jour...');
                console.log('✅ Utilisateur existant trouvé:');
                console.log(`   Email: ${existingUser.email}`);
                console.log(`   Rôle: ${existingUser.role}`);
                console.log(`   Nom: ${existingUser.firstName} ${existingUser.lastName}`);
                await app.close();
                return;
            }
        }
        catch (error) {
            console.log('ℹ️ Utilisateur n\'existe pas, création en cours...');
        }
        console.log('➕ Création du super administrateur...');
        const user = await usersService.createByRole({
            email: adminEmail,
            password: adminPassword,
            firstName: 'Mounkaila',
            lastName: 'Admin',
            role: user_entity_1.AuthUserRole.SUPERADMIN
        });
        console.log('🎉 Superadmin créé avec succès!');
        console.log('🔑 Identifiants de connexion:');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Mot de passe: ${adminPassword}`);
        console.log(`   Rôle: ${user.role}`);
        console.log(`   ID: ${user.id}`);
        console.log('\n🧪 Test de validation...');
        try {
            const testUser = await usersService.findByEmail(adminEmail);
            if (testUser) {
                console.log('✅ Validation réussie - L\'utilisateur est bien créé');
                console.log(`   Actif: ${testUser.isActive}`);
                console.log(`   Tenant ID: ${testUser.tenantId}`);
            }
        }
        catch (error) {
            console.error('❌ Erreur lors de la validation:', error.message);
        }
    }
    catch (error) {
        console.error('❌ Erreur lors de la création du superadmin:', error.message);
        console.error('Détails:', error);
    }
    await app.close();
}
if (require.main === module) {
    createAdmin().catch(error => {
        console.error('💥 Erreur fatale:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=create-admin.js.map