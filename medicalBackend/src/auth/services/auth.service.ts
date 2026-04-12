import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Session } from '../entities/session.entity';
import { PasswordReset } from '../entities/password-reset.entity';
import { Practitioner } from '../../scheduling/entities/practitioner.entity';
import { UsersService } from './users.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { WhatsappNotificationService } from '../../common/services/whatsapp-notification.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>,
    @InjectRepository(PasswordReset)
    private passwordResetRepository: Repository<PasswordReset>,
    @InjectRepository(Practitioner)
    private practitionerRepository: Repository<Practitioner>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
    private whatsappService: WhatsappNotificationService,
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
    if (dto.phoneNumber !== undefined) updateData.phoneNumber = dto.phoneNumber;

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

  /**
   * Trouve le numéro WhatsApp associé à un utilisateur (via practitioners ou user.phoneNumber)
   */
  private async findPhoneNumber(user: User): Promise<string | null> {
    // Chercher d'abord dans la table practitioners (lié par userId)
    const practitioner = await this.practitionerRepository.findOne({
      where: { userId: user.id },
    });
    if (practitioner?.phoneNumber) {
      return practitioner.phoneNumber;
    }

    // Sinon, utiliser le phoneNumber du user
    if (user.phoneNumber) {
      return user.phoneNumber;
    }

    return null;
  }

  /**
   * Génère et envoie un code OTP par WhatsApp pour la réinitialisation du mot de passe
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user || !user.isActive) {
      return { message: 'Si cet email est associé à un compte, un code de vérification a été envoyé sur votre WhatsApp.' };
    }

    // Trouver le numéro WhatsApp
    const phoneNumber = await this.findPhoneNumber(user);
    if (!phoneNumber) {
      this.logger.warn(`Aucun numéro WhatsApp trouvé pour l'utilisateur ${user.id}`);
      return { message: 'Aucun numéro WhatsApp n\'est associé à ce compte. Contactez votre administrateur.' };
    }

    // Invalider les anciens codes non utilisés
    await this.passwordResetRepository.update(
      { userId: user.id, used: false },
      { used: true },
    );

    // Générer un code OTP à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Le code expire dans 15 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await this.passwordResetRepository.save({
      userId: user.id,
      code,
      expiresAt,
    });

    // Envoyer le code par WhatsApp
    const sent = await this.whatsappService.sendPasswordResetCode(
      phoneNumber,
      user.firstName,
      code,
    );

    if (!sent) {
      this.logger.warn(`Échec d'envoi du code de réinitialisation pour l'utilisateur ${user.id}`);
    }

    return { message: 'Un code de vérification a été envoyé sur votre WhatsApp.' };
  }

  /**
   * Vérifie le code OTP et réinitialise le mot de passe
   */
  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException('Code de vérification invalide ou expiré');
    }

    const resetEntry = await this.passwordResetRepository.findOne({
      where: {
        userId: user.id,
        code,
        used: false,
      },
      order: { createdAt: 'DESC' },
    });

    if (!resetEntry) {
      throw new BadRequestException('Code de vérification invalide ou expiré');
    }

    if (new Date() > resetEntry.expiresAt) {
      await this.passwordResetRepository.update(resetEntry.id, { used: true });
      throw new BadRequestException('Code de vérification invalide ou expiré');
    }

    await this.passwordResetRepository.update(resetEntry.id, { used: true });

    const newHash = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.update(user.id, { passwordHash: newHash });

    // Invalider toutes les sessions existantes
    const sessions = await this.sessionsRepository.find({ where: { userId: user.id } });
    if (sessions.length > 0) {
      await this.sessionsRepository.remove(sessions);
    }

    return { message: 'Mot de passe réinitialisé avec succès. Veuillez vous reconnecter.' };
  }
} 