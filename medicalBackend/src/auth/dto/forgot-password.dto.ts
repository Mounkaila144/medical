import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Veuillez entrer une adresse email valide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  email: string;
}
