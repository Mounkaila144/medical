import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MedicalHistoryItem } from '../entities/medical-history-item.entity';
import { MedicalHistoryService } from '../services/medical-history.service';
import { CreateMedicalHistoryItemDto } from '../dto/create-medical-history-item.dto';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { GqlRolesGuard } from '../../auth/guards/gql-roles.guard';
import { Roles } from '../../auth/guards/roles.guard';
import { AuthUserRole } from '../../auth/entities/user.entity';

@Resolver(() => MedicalHistoryItem)
@UseGuards(GqlAuthGuard, GqlRolesGuard)
export class MedicalHistoryResolver {
  constructor(private readonly medicalHistoryService: MedicalHistoryService) {}

  @Query(() => [MedicalHistoryItem])
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async patientMedicalHistory(
    @Args('patientId') patientId: string,
    @Context() context
  ): Promise<MedicalHistoryItem[]> {
    const { user } = context.req;
    return this.medicalHistoryService.listByPatient(patientId, user.tenantId);
  }

  @Mutation(() => MedicalHistoryItem)
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async addMedicalHistoryItem(
    @Args('input') createItemDto: CreateMedicalHistoryItemDto,
    @Context() context
  ): Promise<MedicalHistoryItem> {
    const { user } = context.req;
    return this.medicalHistoryService.addItem(createItemDto, user.tenantId);
  }

  @Mutation(() => Boolean)
  @Roles(AuthUserRole.CLINIC_ADMIN)
  async removeMedicalHistoryItem(
    @Args('id') id: string,
    @Context() context
  ): Promise<boolean> {
    const { user } = context.req;
    await this.medicalHistoryService.remove(id, user.tenantId);
    return true;
  }
} 