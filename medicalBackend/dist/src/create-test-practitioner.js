"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const users_service_1 = require("./auth/services/users.service");
const practitioner_auth_service_1 = require("./auth/services/practitioner-auth.service");
const practitioners_service_1 = require("./scheduling/services/practitioners.service");
const user_entity_1 = require("./auth/entities/user.entity");
const tenant_entity_1 = require("./auth/entities/tenant.entity");
const typeorm_1 = require("@nestjs/typeorm");
const create_practitioner_dto_1 = require("./scheduling/dto/create-practitioner.dto");
async function createTestPractitioner() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const usersService = app.get(users_service_1.UsersService);
    const practitionerAuthService = app.get(practitioner_auth_service_1.PractitionerAuthService);
    const practitionersService = app.get(practitioners_service_1.PractitionersService);
    const tenantRepository = app.get((0, typeorm_1.getRepositoryToken)(tenant_entity_1.Tenant));
    try {
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
        }
        else {
            console.log(`📋 Utilisation du tenant existant: ${tenant.name} (ID: ${tenant.id})`);
        }
        const practitioner = await practitionersService.create(tenant.id, {
            firstName: 'Dr. Sarah',
            lastName: 'Johnson',
            speciality: create_practitioner_dto_1.Speciality.CARDIOLOGY,
            email: 'sarah.johnson@clinic.com',
            phoneNumber: '+1234567890',
            workingHours: [
                {
                    dayOfWeek: create_practitioner_dto_1.DayOfWeek.MONDAY,
                    slots: [{ start: '09:00', end: '17:00' }]
                },
                {
                    dayOfWeek: create_practitioner_dto_1.DayOfWeek.TUESDAY,
                    slots: [{ start: '09:00', end: '17:00' }]
                },
                {
                    dayOfWeek: create_practitioner_dto_1.DayOfWeek.WEDNESDAY,
                    slots: [{ start: '09:00', end: '17:00' }]
                },
                {
                    dayOfWeek: create_practitioner_dto_1.DayOfWeek.THURSDAY,
                    slots: [{ start: '09:00', end: '17:00' }]
                },
                {
                    dayOfWeek: create_practitioner_dto_1.DayOfWeek.FRIDAY,
                    slots: [{ start: '09:00', end: '17:00' }]
                }
            ],
            slotDuration: 30,
            color: '#FF5733'
        });
        console.log(`✅ Praticien créé: ${practitioner.firstName} ${practitioner.lastName} (ID: ${practitioner.id})`);
        const email = 'sarah.johnson@clinic.com';
        const user = await usersService.createByRole({
            email,
            password: 'practitioner123',
            firstName: practitioner.firstName,
            lastName: practitioner.lastName,
            role: user_entity_1.AuthUserRole.PRACTITIONER,
            tenantId: practitioner.tenantId,
        });
        console.log(`✅ Utilisateur créé: ${user.email} (ID: ${user.id})`);
        await practitionerAuthService.linkUserToPractitioner(user.id, practitioner.id);
        console.log(`✅ Utilisateur lié au praticien`);
        console.log('\n🎉 Praticien de test créé avec succès !');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Mot de passe: practitioner123`);
    }
    catch (error) {
        console.error('❌ Erreur:', error.message);
    }
    finally {
        await app.close();
    }
}
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
//# sourceMappingURL=create-test-practitioner.js.map