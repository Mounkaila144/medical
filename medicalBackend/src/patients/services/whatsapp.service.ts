import { Injectable } from '@nestjs/common';
import { Patient } from '../entities/patient.entity';

@Injectable()
export class WhatsappService {
  /**
   * Génère un lien WhatsApp pour partager les informations d'un patient
   * @param patient Les données du patient
   * @param phoneNumber Le numéro WhatsApp de destination
   * @returns L'URL de redirection WhatsApp
   */
  generateWhatsappLink(patient: Patient, phoneNumber: string = '22797977199'): string {
    // Formater la date de naissance de manière sécurisée
    let formattedDate = 'Non spécifié';
    if (patient.dob) {
      try {
        // Si c'est déjà un objet Date, utiliser toLocaleDateString
        if (patient.dob instanceof Date) {
          formattedDate = patient.dob.toLocaleDateString();
        } 
        // Si c'est une chaîne de caractères, la convertir en Date
        else if (typeof patient.dob === 'string') {
          const date = new Date(patient.dob);
          formattedDate = date.toLocaleDateString();
        }
      } catch (error) {
        // En cas d'erreur, utiliser la valeur brute
        formattedDate = String(patient.dob);
      }
    }

    // Construction du message
    const message = `
Nouveau patient enregistré:
Nom: ${patient.firstName} ${patient.lastName}
Date de naissance: ${formattedDate}
Genre: ${patient.gender}
Téléphone: ${patient.phone || 'Non spécifié'}
Email: ${patient.email || 'Non spécifié'}
MRN: ${patient.mrn}
    `.trim();

    // Génération de l'URL WhatsApp
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  }
} 