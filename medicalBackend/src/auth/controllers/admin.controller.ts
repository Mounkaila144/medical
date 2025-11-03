import { Controller, Get, Post, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { SuperadminService } from '../services/superadmin.service';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthUserRole } from '../entities/user.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AuthUserRole.SUPERADMIN)
export class AdminController {
  constructor(private superadminService: SuperadminService) {}

  @Get('tenants')
  async findAllTenants() {
    return this.superadminService.findAllTenants();
  }

  @Post('tenants')
  async createTenant(@Body() createTenantDto: CreateTenantDto) {
    return this.superadminService.createTenantWithAdmin(createTenantDto);
  }

  @Post('tenants/:id/deactivate')
  async deactivateTenant(@Param('id', ParseUUIDPipe) id: string) {
    return this.superadminService.deactivateTenant(id);
  }

  @Post('tenants/:id/reactivate')
  async reactivateTenant(@Param('id', ParseUUIDPipe) id: string) {
    return this.superadminService.reactivateTenant(id);
  }
} 