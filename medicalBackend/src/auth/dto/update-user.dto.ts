import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { AuthUserRole } from '../entities/user.entity';

export class UpdateUserDto {
  @IsEmail({}, { message: 'Veuillez entrer une adresse email valide' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  @IsOptional()
  password?: string;

  @IsEnum(AuthUserRole, { message: 'Le rôle doit être valide' })
  @IsOptional()
  role?: AuthUserRole;

  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  @IsOptional()
  firstName?: string;

  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsOptional()
  lastName?: string;

  @IsBoolean({ message: 'Le statut actif doit être un booléen' })
  @IsOptional()
  isActive?: boolean;
} 