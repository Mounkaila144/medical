import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { EncountersService } from '../services/encounters.service';
import { Encounter } from '../entities/encounter.entity';
import { CreateEncounterDto } from '../dto/create-encounter.dto';
import { UpdateEncounterDto } from '../dto/update-encounter.dto';
import { LockEncounterDto } from '../dto/lock-encounter.dto';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUserRole } from '../../auth/entities/user.entity';
import { EHRSupervisorGuard } from '../guards/ehr-supervisor.guard';

@Resolver(() => Encounter)
@UseGuards(GqlAuthGuard, RolesGuard)
export class EncountersResolver {
  constructor(private readonly encountersService: EncountersService) {}

  @Mutation(() => Encounter)
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async createEncounter(
    @Args('createEncounterDto') createEncounterDto: CreateEncounterDto,
    @Context() context,
  ) {
    return this.encountersService.create(context.req.user.tenantId, createEncounterDto);
  }

  @Query(() => [Encounter])
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async encounters(@Context() context) {
    return this.encountersService.findAll(context.req.user.tenantId);
  }

  @Query(() => Encounter)
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async encounter(@Args('id') id: string) {
    return this.encountersService.findOne(id);
  }

  @Mutation(() => Encounter)
  @UseGuards(EHRSupervisorGuard)
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async updateEncounter(
    @Args('updateEncounterDto') updateEncounterDto: UpdateEncounterDto,
    @Context() context,
  ) {
    return this.encountersService.update(context.req.user.tenantId, updateEncounterDto);
  }

  @Mutation(() => Encounter)
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async lockEncounter(
    @Args('lockEncounterDto') lockEncounterDto: LockEncounterDto,
    @Context() context,
  ) {
    return this.encountersService.lock(context.req.user.tenantId, lockEncounterDto);
  }
} 