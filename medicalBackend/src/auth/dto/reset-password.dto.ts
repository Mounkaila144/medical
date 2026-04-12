import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Veuillez entrer une adresse email valide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  email: string;

  @IsString({ message: 'Le code doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le code de vérification est requis' })
  code: string;

  @IsString({ message: 'Le nouveau mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nouveau mot de passe est requis' })
  @MinLength(8, { message: 'Le nouveau mot de passe doit contenir au moins 8 caractères' })
  newPassword: string;
}
