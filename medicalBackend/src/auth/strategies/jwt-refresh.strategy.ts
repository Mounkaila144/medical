import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsersService } from '../services/users.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!refreshToken) {
      throw new UnauthorizedException('Token de rafraîchissement manquant');
    }

    const { sub: userId } = payload;
    const user = await this.usersService.findById(userId);
    
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Utilisateur non autorisé ou inactif');
    }

    // Vérifier si le token de rafraîchissement est valide en utilisant la méthode existante
    const isValid = await this.authService.validateRefreshToken(userId, refreshToken);
    
    if (!isValid) {
      throw new UnauthorizedException('Token de rafraîchissement invalide ou expiré');
    }

    // Ne pas inclure le mot de passe dans l'objet retourné
    const { passwordHash, ...result } = user;
    return { ...result, refreshToken };
  }
} 