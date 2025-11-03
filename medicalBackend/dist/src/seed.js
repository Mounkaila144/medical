"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const users_service_1 = require("./auth/services/users.service");
const user_entity_1 = require("./auth/entities/user.entity");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const usersService = app.get(users_service_1.UsersService);
    try {
        const existingUser = await usersService.findByEmail('admin@example.com');
        if (existingUser) {
            console.log('Le superadmin existe déjà');
            await app.close();
            return;
        }
    }
    catch (error) {
    }
    try {
        const user = await usersService.createByRole({
            email: 'admin@example.com',
            password: 'password123',
            firstName: 'Admin',
            lastName: 'User',
            role: user_entity_1.AuthUserRole.SUPERADMIN
        });
        console.log('Superadmin créé avec succès:');
        console.log('Email: admin@example.com');
        console.log('Mot de passe: password123');
    }
    catch (error) {
        console.error('Erreur lors de la création du superadmin:', error.message);
    }
    await app.close();
}
bootstrap();
//# sourceMappingURL=seed.js.map