import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tariff, TariffCategory } from '../entities';
import { CreateTariffGqlDto } from '../dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUserRole } from '../../auth/entities/user.entity';

@Resolver(() => Tariff)
@UseGuards(JwtAuthGuard, RolesGuard)
export class TariffsResolver {
  constructor(
    @InjectRepository(Tariff)
    private tariffRepository: Repository<Tariff>,
  ) {}

  @Query(() => [Tariff])
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async tariffs(@Context() context) {
    return this.tariffRepository.find({
      where: { tenantId: context.req.user.tenantId },
    });
  }

  @Query(() => [Tariff])
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async tariffsByCategory(
    @Args('category') category: TariffCategory,
    @Context() context,
  ) {
    return this.tariffRepository.find({
      where: {
        tenantId: context.req.user.tenantId,
        category,
      },
    });
  }

  @Mutation(() => Tariff)
  @Roles(AuthUserRole.SUPERADMIN, AuthUserRole.CLINIC_ADMIN)
  async createTariff(
    @Args('createTariffDto') createTariffDto: CreateTariffGqlDto,
    @Context() context,
  ) {
    const tariff = this.tariffRepository.create({
      ...createTariffDto,
      tenantId: context.req.user.tenantId,
    });
    return this.tariffRepository.save(tariff);
  }
} 