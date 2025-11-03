import { Controller, Post, Body, Res, Param, UseInterceptors } from '@nestjs/common';
import { PatientsService } from '../services/patients.service';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { WhatsappService } from '../services/whatsapp.service';
import { Public } from '../../common/decorators/public.decorator';
import { WhatsappRedirectInterceptor } from '../../common/interceptors/whatsapp-redirect.interceptor';

@Controller('public/patients')
@UseInterceptors(WhatsappRedirectInterceptor)
export class PublicPatientsController {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly whatsappService: WhatsappService
  ) {}

  @Public()
  @Post(':tenantId')
  async createAndRedirect(
    @Body() createPatientDto: CreatePatientDto,
    @Param('tenantId') tenantId: string,
    @Res() res
  ): Promise<void> {
    // S'assurer que le tenantId est utilisé (sécurité)
    createPatientDto.clinicId = tenantId;
    
    // Créer le patient
    const patient = await this.patientsService.create(createPatientDto, tenantId);
    
    // Générer le lien WhatsApp
    const whatsappUrl = this.whatsappService.generateWhatsappLink(patient);
    
    // Retourner l'URL avec les informations du patient pour la redirection
    res.status(201).json({
      success: true,
      message: "Patient enregistré avec succès. Vous allez être redirigé vers WhatsApp.",
      redirectUrl: whatsappUrl
    });
  }
} 