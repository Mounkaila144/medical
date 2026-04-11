import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Session } from '../entities/session.entity';
import { UsersService } from './users.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({ 
      where: { email },
      relations: ['tenant'] // Inclure la relation tenant
    });
    if (!user) {
      return null;
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Ce compte a été désactivé');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    // Mettre à jour la date de dernière connexion
    await this.usersRepository.update(user.id, {
      lastLogin: new Date(),
    });

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(user: any) {
    return this.generateTokens(user);
  }

  async refresh(userId: string, refreshToken: string) {
    // Valider le refreshToken
    const isValid = await this.validateRefreshToken(userId, refreshToken);
    if (!isValid) {
      throw new UnauthorizedException('Token de rafraîchissement invalide');
    }

    // Récupérer l'utilisateur
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    // Générer de nouveaux tokens
    return this.generateTokens(user);
  }

  async logout(userId: string, refreshToken: string) {
    // Supprimer toutes les sessions de l'utilisateur pour une déconnexion complète
    // Cela permet d'éviter le problème de "session fantôme" où le token pourrait continuer à fonctionner
    const sessions = await this.sessionsRepository.find({
      where: { userId },
    }) || [];

    // Supprimer toutes les sessions de l'utilisateur
    let removedCount = 0;
    if (sessions && sessions.length > 0) {
      for (const session of sessions) {
        await this.sessionsRepository.remove(session);
        removedCount++;
      }
    }
    
    return { success: true, removedSessions: removedCount };
  }

  async validateRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    const sessions = await this.sessionsRepository.find({
      where: { userId },
    });

    // Vérifier si l'un des tokens correspond
    for (const session of sessions) {
      const isValid = await bcrypt.compare(refreshToken, session.refreshTokenHash);
      if (isValid) {
        // Vérifier si le token n'est pas expiré
        if (new Date() > session.expiresAt) {
          await this.sessionsRepository.remove(session);
          return false;
        }
        return true;
      }
    }

    return false;
  }

  private async generateTokens(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };

    const accessExpiry = this.configService.get('JWT_ACCESS_EXPIRY', '15m');
    const refreshExpiry = this.configService.get('JWT_REFRESH_EXPIRY', '365d');
    const refreshExpiryDays = parseInt(this.configService.get('JWT_REFRESH_EXPIRY_DAYS', '365'), 10);

    // Générer le jeton d'accès
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: accessExpiry,
    });

    // Générer le jeton de rafraîchissement (longue durée pour session persistante)
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpiry,
    });

    // Stocker le jeton de rafraîchissement dans la base de données
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshExpiryDays);

    // Créer une nouvelle session
    await this.sessionsRepository.save({
      userId: user.id,
      refreshTokenHash,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        tenantId: user.tenantId, // Inclure le tenantId
      },
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<any> {
    const user = await this.usersService.findById(userId);

    const updateData: Partial<User> = {};
    if (dto.firstName !== undefined) updateData.firstName = dto.firstName;
    if (dto.lastName !== undefined) updateData.lastName = dto.lastName;
    if (dto.email !== undefined) updateData.email = dto.email;

    await this.usersRepository.update(userId, updateData);

    const updatedUser = await this.usersService.findById(userId);
    const { passwordHash, ...result } = updatedUser;
    return result;
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new BadRequestException('Mot de passe actuel incorrect');
    }

    const newHash = await bcrypt.hash(dto.newPassword, 10);
    await this.usersRepository.update(userId, { passwordHash: newHash });

    return { message: 'Mot de passe modifié avec succès' };
  }
} 