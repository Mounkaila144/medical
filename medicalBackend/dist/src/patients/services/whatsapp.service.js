"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
const common_1 = require("@nestjs/common");
let WhatsappService = class WhatsappService {
    generateWhatsappLink(patient, phoneNumber = '22797977199') {
        let formattedDate = 'Non spécifié';
        if (patient.dob) {
            try {
                if (patient.dob instanceof Date) {
                    formattedDate = patient.dob.toLocaleDateString();
                }
                else if (typeof patient.dob === 'string') {
                    const date = new Date(patient.dob);
                    formattedDate = date.toLocaleDateString();
                }
            }
            catch (error) {
                formattedDate = String(patient.dob);
            }
        }
        const message = `
Nouveau patient enregistré:
Nom: ${patient.firstName} ${patient.lastName}
Date de naissance: ${formattedDate}
Genre: ${patient.gender}
Téléphone: ${patient.phone || 'Non spécifié'}
Email: ${patient.email || 'Non spécifié'}
MRN: ${patient.mrn}
    `.trim();
        return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    }
};
exports.WhatsappService = WhatsappService;
exports.WhatsappService = WhatsappService = __decorate([
    (0, common_1.Injectable)()
], WhatsappService);
//# sourceMappingURL=whatsapp.service.js.map