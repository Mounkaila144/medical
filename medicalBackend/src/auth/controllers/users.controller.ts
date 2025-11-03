import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { AuthUserRole } from '../entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN)
  async create(@Body() createUserDto: CreateUserDto, @CurrentUser() currentUser) {
    // Si l'utilisateur est un admin de clinique, forcer le tenantId à celui de l'admin
    if (currentUser.role === AuthUserRole.CLINIC_ADMIN) {
      createUserDto.tenantId = currentUser.tenantId;
      
      // Les admins de clinique ne peuvent créer que des employés
      if (createUserDto.role !== AuthUserRole.EMPLOYEE) {
        createUserDto.role = AuthUserRole.EMPLOYEE;
      }
    }

    return this.usersService.createByRole(createUserDto, currentUser.id);
  }

  @Get()
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN)
  async findAll(@CurrentUser() currentUser) {
    // Les superadmins peuvent voir tous les utilisateurs
    if (currentUser.role === AuthUserRole.SUPERADMIN) {
      return this.usersService.findAllSuperadmins();
    }
    
    // Les admins de clinique ne peuvent voir que les utilisateurs de leur tenant
    return this.usersService.findAllByTenant(currentUser.tenantId);
  }

  @Get(':id')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser
  ) {
    // Les admins de clinique ne peuvent pas changer le rôle
    if (currentUser.role === AuthUserRole.CLINIC_ADMIN) {
      delete updateUserDto.role;
    }

    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.deactivate(id);
  }
} 