import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, Req, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientsService } from '../services/patients.service';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { UpdatePatientDto } from '../dto/update-patient.dto';
import { SearchPatientDto } from '../dto/search-patient.dto';
import { Patient } from '../entities/patient.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/guards/roles.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AuthUserRole } from '../../auth/entities/user.entity';
import { WhatsappService } from '../services/whatsapp.service';

@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly whatsappService: WhatsappService,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  @Post()
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE, AuthUserRole.PRACTITIONER)
  async create(
    @Body() createPatientDto: CreatePatientDto,
    @Req() req,
    @Res() res
  ): Promise<void> {
    const tenantId = req.user.tenantId;
    const patient = await this.patientsService.create(createPatientDto, tenantId);
    
    // Générer le lien WhatsApp
    const whatsappUrl = this.whatsappService.generateWhatsappLink(patient);
    
    // Retourner l'URL avec les informations du patient pour la redirection
    res.status(201).json({
      patient,
      redirectUrl: whatsappUrl
    });
  }

  @Get()
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE, AuthUserRole.PRACTITIONER)
  async findAll(@Req() req, @Query() query: any): Promise<Patient[]> {
    const tenantId = req.user.tenantId;
    // Handle pagination and filtering parameters
    const { page, limit, search, sortBy, sortOrder, gender, ...otherParams } = query;
    return this.patientsService.findAll(tenantId);
  }

  @Get('check-duplicate')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE, AuthUserRole.PRACTITIONER)
  async checkDuplicate(
    @Query('firstName') firstName: string,
    @Query('lastName') lastName: string,
    @Query('dob') dob: string,
    @Req() req,
  ): Promise<{ duplicates: Patient[]; hasDuplicates: boolean }> {
    const tenantId = req.user.tenantId;

    const qb = this.patientRepository
      .createQueryBuilder('patient')
      .where('patient.clinicId = :tenantId', { tenantId })
      .andWhere('LOWER(patient.firstName) LIKE LOWER(:firstName)', { firstName: `%${firstName}%` })
      .andWhere('LOWER(patient.lastName) LIKE LOWER(:lastName)', { lastName: `%${lastName}%` });

    if (dob) {
      qb.andWhere('patient.dob = :dob', { dob });
    }

    const duplicates = await qb.getMany();
    return { duplicates, hasDuplicates: duplicates.length > 0 };
  }

  @Get('search')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE, AuthUserRole.PRACTITIONER)
  async search(
    @Query() searchParams: SearchPatientDto,
    @Req() req
  ): Promise<Patient[]> {
    const tenantId = req.user.tenantId;
    return this.patientsService.search({ ...searchParams, clinicId: tenantId });
  }

  @Get(':id')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE, AuthUserRole.PRACTITIONER)
  async findOne(
    @Param('id') id: string,
    @Req() req
  ): Promise<Patient> {
    const tenantId = req.user.tenantId;
    return this.patientsService.findOne(id, tenantId);
  }

  @Put(':id')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE, AuthUserRole.PRACTITIONER)
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @Req() req
  ): Promise<Patient> {
    const tenantId = req.user.tenantId;
    return this.patientsService.update(id, updatePatientDto, tenantId);
  }

  @Delete(':id')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN)
  async remove(
    @Param('id') id: string,
    @Req() req
  ): Promise<void> {
    const tenantId = req.user.tenantId;
    return this.patientsService.archive(id, tenantId);
  }
} 