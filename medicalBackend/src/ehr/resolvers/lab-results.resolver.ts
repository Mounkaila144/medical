import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { LabResultsService } from '../services/lab-results.service';
import { LabResult } from '../entities/lab-result.entity';
import { CreateLabResultDto } from '../dto/create-lab-result.dto';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Resolver(() => LabResult)
@UseGuards(GqlAuthGuard, RolesGuard)
export class LabResultsResolver {
  constructor(private readonly labResultsService: LabResultsService) {}

  @Mutation(() => LabResult)
  @Roles(UserRole.DOCTOR, UserRole.SUPERVISOR, UserRole.LABORATORY_TECHNICIAN)
  async addLabResult(
    @Args('createLabResultDto') createLabResultDto: CreateLabResultDto,
    @Context() context,
  ) {
    return this.labResultsService.add(context.req.user.tenantId, createLabResultDto);
  }

  @Query(() => [LabResult])
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.SUPERVISOR, UserRole.LABORATORY_TECHNICIAN)
  async labResults(@Context() context) {
    return this.labResultsService.findAll(context.req.user.tenantId);
  }

  @Query(() => [LabResult])
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.SUPERVISOR, UserRole.LABORATORY_TECHNICIAN)
  async patientLabResults(@Args('patientId') patientId: string, @Context() context) {
    return this.labResultsService.findAllByPatient(context.req.user.tenantId, patientId);
  }

  @Query(() => LabResult)
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.SUPERVISOR, UserRole.LABORATORY_TECHNICIAN)
  async labResult(@Args('id') id: string) {
    return this.labResultsService.findOne(id);
  }
} 