import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateTenantDto {
  @IsString({ message: 'Le nom du tenant doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom du tenant est requis' })
  name: string;

  @IsString({ message: 'Le slug du tenant doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le slug du tenant est requis' })
  slug: string;

  // Informations pour l'administrateur du tenant
  @IsEmail({}, { message: 'Veuillez entrer une adresse email valide pour l\'administrateur' })
  @IsNotEmpty({ message: 'L\'email de l\'administrateur est requis' })
  adminEmail: string;

  @IsString({ message: 'Le mot de passe de l\'administrateur doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le mot de passe de l\'administrateur est requis' })
  @MinLength(8, { message: 'Le mot de passe de l\'administrateur doit contenir au moins 8 caractères' })
  adminPassword: string;

  @IsString({ message: 'Le prénom de l\'administrateur doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le prénom de l\'administrateur est requis' })
  adminFirstName: string;

  @IsString({ message: 'Le nom de l\'administrateur doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom de l\'administrateur est requis' })
  adminLastName: string;
} 