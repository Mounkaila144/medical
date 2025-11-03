import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { MedicalHistoryService } from '../services/medical-history.service';
import { CreateMedicalHistoryItemDto } from '../dto/create-medical-history-item.dto';
import { MedicalHistoryItem } from '../entities/medical-history-item.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/guards/roles.guard';
import { AuthUserRole } from '../../auth/entities/user.entity';

@Controller('patients/medical-history')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicalHistoryController {
  constructor(private readonly medicalHistoryService: MedicalHistoryService) {}

  @Post()
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async addItem(
    @Body() createItemDto: CreateMedicalHistoryItemDto,
    @Req() req
  ): Promise<MedicalHistoryItem> {
    const tenantId = req.user.tenantId;
    return this.medicalHistoryService.addItem(createItemDto, tenantId);
  }

  @Get('patient/:patientId')
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async listByPatient(
    @Param('patientId') patientId: string,
    @Req() req
  ): Promise<MedicalHistoryItem[]> {
    const tenantId = req.user.tenantId;
    return this.medicalHistoryService.listByPatient(patientId, tenantId);
  }

  @Delete(':id')
  @Roles(AuthUserRole.CLINIC_ADMIN)
  async remove(
    @Param('id') id: string,
    @Req() req
  ): Promise<void> {
    const tenantId = req.user.tenantId;
    return this.medicalHistoryService.remove(id, tenantId);
  }
} 