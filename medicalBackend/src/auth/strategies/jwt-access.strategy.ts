import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../services/users.service';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: any) {
    const { sub: userId } = payload;
    const user = await this.usersService.findById(userId);
    
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Utilisateur non autorisé ou inactif');
    }

    // Ne pas inclure le mot de passe dans l'objet retourné
    const { passwordHash, ...result } = user;
    return result;
  }
} 