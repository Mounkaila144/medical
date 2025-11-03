import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './auth/services/users.service';
import { AuthUserRole } from './auth/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './auth/entities/user.entity';
import { Repository } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  // Obtenir le service d'utilisateurs
  const usersService = app.get(UsersService);
  
  // Vérifier si l'utilisateur existe déjà
  try {
    const existingUser = await usersService.findByEmail('admin@example.com');
    if (existingUser) {
      console.log('Le superadmin existe déjà');
      await app.close();
      return;
    }
  } catch (error) {
    // Continuer si l'utilisateur n'existe pas
  }

  // Créer un super administrateur
  try {
    const user = await usersService.createByRole({
      email: 'admin@example.com',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
      role: AuthUserRole.SUPERADMIN
    });

    console.log('Superadmin créé avec succès:');
    console.log('Email: admin@example.com');
    console.log('Mot de passe: password123');
  } catch (error) {
    console.error('Erreur lors de la création du superadmin:', error.message);
  }

  await app.close();
}

bootstrap(); 