import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { PrescriptionsService } from '../services/prescriptions.service';
import { Prescription } from '../entities/prescription.entity';
import { CreatePrescriptionGqlDto } from '../dto/create-prescription.dto';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUserRole } from '../../auth/entities/user.entity';

@Resolver(() => Prescription)
@UseGuards(GqlAuthGuard, RolesGuard)
export class PrescriptionsResolver {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Mutation(() => Prescription)
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async createPrescription(
    @Args('createPrescriptionDto') createPrescriptionDto: CreatePrescriptionGqlDto,
    @Context() context,
  ) {
    return this.prescriptionsService.create(context.req.user.tenantId, createPrescriptionDto);
  }

  @Query(() => [Prescription])
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async prescriptions(@Context() context) {
    return this.prescriptionsService.findAll(context.req.user.tenantId);
  }

  @Query(() => Prescription)
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async prescription(@Args('id') id: string) {
    return this.prescriptionsService.findOne(id);
  }
} 