import { Controller, Post, Body, Res, Param, UseInterceptors, BadRequestException } from '@nestjs/common';
import { PatientsService } from '../services/patients.service';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { WhatsappService } from '../services/whatsapp.service';
import { Public } from '../../common/decorators/public.decorator';
import { WhatsappRedirectInterceptor } from '../../common/interceptors/whatsapp-redirect.interceptor';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../auth/entities/tenant.entity';

@Controller('public/patients')
@UseInterceptors(WhatsappRedirectInterceptor)
export class PublicPatientsController {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly whatsappService: WhatsappService,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  @Public()
  @Post(':tenantId')
  async createAndRedirect(
    @Body() createPatientDto: CreatePatientDto,
    @Param('tenantId') tenantId: string,
    @Res() res
  ): Promise<void> {
    // Valider que le tenant existe et est actif
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new BadRequestException('Tenant non trouvé');
    }
    if (!tenant.isActive) {
      throw new BadRequestException('Ce tenant est désactivé');
    }

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