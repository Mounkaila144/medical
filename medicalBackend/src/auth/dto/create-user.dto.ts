import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { AuthUserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail({}, { message: 'Veuillez entrer une adresse email valide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  email: string;

  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  password: string;

  @IsEnum(AuthUserRole, { message: 'Le rôle doit être valide' })
  @IsNotEmpty({ message: 'Le rôle est requis' })
  role: AuthUserRole;

  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le prénom est requis' })
  firstName: string;

  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom est requis' })
  lastName: string;

  @IsUUID('4', { message: 'L\'ID du tenant doit être un UUID valide' })
  @IsOptional()
  tenantId?: string;
} 