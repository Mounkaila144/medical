import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsappNotificationService {
  private readonly logger = new Logger(WhatsappNotificationService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly instanceName: string;

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('EVOLUTION_API_URL', '');
    this.apiKey = this.configService.get<string>('EVOLUTION_API_KEY', '');
    this.instanceName = this.configService.get<string>('EVOLUTION_INSTANCE_NAME', '');
  }

  private isConfigured(): boolean {
    return !!(this.apiUrl && this.apiKey && this.instanceName);
  }

  /**
   * Envoie un message texte via l'Evolution API WhatsApp
   */
  async sendMessage(phoneNumber: string, text: string): Promise<boolean> {
    if (!this.isConfigured()) {
      this.logger.warn('Evolution API non configurée. Message WhatsApp non envoyé.');
      return false;
    }

    // Nettoyer le numéro de téléphone (garder uniquement les chiffres)
    let cleanNumber = phoneNumber.replace(/[^0-9]/g, '');

    // Si c'est un numéro Niger (8 chiffres), ajouter l'indicatif 227
    if (cleanNumber.length === 8) {
      cleanNumber = '227' + cleanNumber;
    }

    try {
      const url = `${this.apiUrl}/message/sendText/${this.instanceName}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: cleanNumber,
          text,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(`Erreur Evolution API (${response.status}): ${errorBody}`);
        return false;
      }

      this.logger.log(`Message WhatsApp envoyé à ${cleanNumber}`);
      return true;
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi du message WhatsApp: ${error.message}`);
      return false;
    }
  }

  /**
   * Envoie un message de confirmation de création de compte
   */
  async sendAccountCreationNotification(
    phoneNumber: string,
    firstName: string,
    lastName: string,
    email: string,
  ): Promise<boolean> {
    const message = `🏥 *Clinoo*

Bonjour ${firstName} ${lastName},

Votre compte a été créé avec succès !

📧 Email de connexion : ${email}

Veuillez vous connecter et changer votre mot de passe lors de votre première connexion.

Cordialement,
L'équipe médicale Clinoo`;

    return this.sendMessage(phoneNumber, message);
  }

  /**
   * Envoie les identifiants de connexion d'un praticien
   */
  async sendPractitionerCredentials(
    phoneNumber: string,
    firstName: string,
    lastName: string,
    email: string,
    temporaryPassword: string,
  ): Promise<boolean> {
    const message = `🏥 *Clinoo*

Bonjour Dr. ${firstName} ${lastName},

Votre compte praticien a été créé avec succès !

Voici vos identifiants de connexion :
📧 Email : ${email}
🔑 Mot de passe temporaire : ${temporaryPassword}

⚠️ *Important* : Veuillez changer votre mot de passe lors de votre première connexion pour des raisons de sécurité.

Cordialement,
L'équipe médicale Clinoo`;

    return this.sendMessage(phoneNumber, message);
  }

  /**
   * Envoie un code OTP pour la réinitialisation du mot de passe
   */
  async sendPasswordResetCode(
    phoneNumber: string,
    firstName: string,
    code: string,
  ): Promise<boolean> {
    const message = `🏥 *Clinoo*

Bonjour ${firstName},

Vous avez demandé la réinitialisation de votre mot de passe.

🔐 Votre code de vérification : *${code}*

⏱️ Ce code est valable pendant 15 minutes.

Si vous n'avez pas fait cette demande, veuillez ignorer ce message.

Cordialement,
L'équipe médicale Clinoo`;

    return this.sendMessage(phoneNumber, message);
  }
}
