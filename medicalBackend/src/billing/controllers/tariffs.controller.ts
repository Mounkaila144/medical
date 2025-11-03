import { Controller, Get, Post, Patch, Delete, Body, UseGuards, Req, Param, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Tariff, TariffCategory } from '../entities';
import { CreateTariffDto } from '../dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUserRole } from '../../auth/entities/user.entity';

@Controller('tariffs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TariffsController {
  constructor(
    @InjectRepository(Tariff)
    private tariffRepository: Repository<Tariff>,
  ) {}

  @Post()
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN)
  async create(@Body() createTariffDto: CreateTariffDto, @Req() req) {
    const tariff = this.tariffRepository.create({
      ...createTariffDto,
      tenantId: req.user.tenantId,
    });
    return this.tariffRepository.save(tariff);
  }

  @Get()
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async findAll(
    @Req() req,
    @Query('category') category?: TariffCategory,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ) {
    const where: any = { tenantId: req.user.tenantId };

    if (category) {
      where.category = category;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (search) {
      return this.tariffRepository
        .createQueryBuilder('tariff')
        .where('tariff.tenantId = :tenantId', { tenantId: req.user.tenantId })
        .andWhere('(tariff.name LIKE :search OR tariff.code LIKE :search OR tariff.description LIKE :search)', { search: `%${search}%` })
        .andWhere(category ? 'tariff.category = :category' : '1=1', { category })
        .andWhere(isActive !== undefined ? 'tariff.isActive = :isActive' : '1=1', { isActive: isActive === 'true' })
        .getMany();
    }

    return this.tariffRepository.find({ where });
  }

  @Get(':id')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async findOne(@Param('id') id: string, @Req() req) {
    return this.tariffRepository.findOne({
      where: { id, tenantId: req.user.tenantId },
    });
  }

  @Get('category/:category')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async findByCategory(@Param('category') category: TariffCategory, @Req() req) {
    return this.tariffRepository.find({
      where: {
        tenantId: req.user.tenantId,
        category,
      },
    });
  }

  @Patch(':id')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN)
  async update(@Param('id') id: string, @Body() updateTariffDto: Partial<CreateTariffDto>, @Req() req) {
    await this.tariffRepository.update(
      { id, tenantId: req.user.tenantId },
      updateTariffDto,
    );
    return this.tariffRepository.findOne({
      where: { id, tenantId: req.user.tenantId },
    });
  }

  @Delete(':id')
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN)
  async remove(@Param('id') id: string, @Req() req) {
    await this.tariffRepository.delete({
      id,
      tenantId: req.user.tenantId,
    });
    return { message: 'Tariff deleted successfully' };
  }
} 