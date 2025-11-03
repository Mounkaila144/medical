import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString({ message: 'Le refresh token doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le refresh token est requis' })
  refreshToken: string;
} 