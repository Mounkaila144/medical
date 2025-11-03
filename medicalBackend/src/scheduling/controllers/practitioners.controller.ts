import { Controller, Post, Body, UseGuards, Req, Get, Put, Delete, Param } from '@nestjs/common';
import { PractitionersService } from '../services/practitioners.service';
import { CreatePractitionerDto } from '../dto/create-practitioner.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUserRole } from '../../auth/entities/user.entity';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('practitioners')
@UseGuards(JwtAuthGuard, TenantGuard)
export class PractitionersController {
  constructor(private readonly practitionersService: PractitionersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN)
  async create(@TenantId() tenantId: string, @Body() createPractitionerDto: CreatePractitionerDto) {
    return this.practitionersService.create(tenantId, createPractitionerDto);
  }

  @Get()
  async getAll(@TenantId() tenantId: string) {
    return this.practitionersService.findAll(tenantId);
  }

  @Get(':id')
  async getOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.practitionersService.findOne(tenantId, id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN)
  async update(
    @TenantId() tenantId: string, 
    @Param('id') id: string, 
    @Body() updatePractitionerDto: Partial<CreatePractitionerDto>
  ) {
    return this.practitionersService.update(tenantId, id, updatePractitionerDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN)
  async delete(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.practitionersService.delete(tenantId, id);
  }
} 