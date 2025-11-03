import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { EncountersService } from '../services/encounters.service';
import { CreateEncounterDto } from '../dto/create-encounter.dto';
import { UpdateEncounterDto } from '../dto/update-encounter.dto';
import { LockEncounterDto } from '../dto/lock-encounter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUserRole } from '../../auth/entities/user.entity';
import { EHRSupervisorGuard } from '../guards/ehr-supervisor.guard';

@Controller('encounters')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EncountersController {
  constructor(private readonly encountersService: EncountersService) {}

  @Post()
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async create(@Body() createEncounterDto: CreateEncounterDto, @Req() req) {
    return this.encountersService.create(req.user.tenantId, createEncounterDto);
  }

  @Get()
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async findAll(@Req() req) {
    return this.encountersService.findAll(req.user.tenantId);
  }

  @Get(':id')
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async findOne(@Param('id') id: string) {
    return this.encountersService.findOne(id);
  }

  @Patch()
  @UseGuards(EHRSupervisorGuard)
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async update(@Body() updateEncounterDto: UpdateEncounterDto, @Req() req) {
    return this.encountersService.update(req.user.tenantId, updateEncounterDto);
  }

  @Post('lock')
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async lock(@Body() lockEncounterDto: LockEncounterDto, @Req() req) {
    return this.encountersService.lock(req.user.tenantId, lockEncounterDto);
  }
} 