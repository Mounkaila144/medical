import { Args, Mutation, Query, Resolver, Context } from '@nestjs/graphql';
import { Patient } from '../entities/patient.entity';
import { PatientsService } from '../services/patients.service';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { UpdatePatientDto } from '../dto/update-patient.dto';
import { SearchPatientDto } from '../dto/search-patient.dto';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { GqlRolesGuard } from '../../auth/guards/gql-roles.guard';
import { Roles } from '../../auth/guards/roles.guard';
import { AuthUserRole } from '../../auth/entities/user.entity';

@Resolver(() => Patient)
@UseGuards(GqlAuthGuard, GqlRolesGuard)
export class PatientsResolver {
  constructor(private readonly patientsService: PatientsService) {}

  @Mutation(() => Patient)
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async createPatient(
    @Args('input') createPatientDto: CreatePatientDto,
    @Context() context
  ): Promise<Patient> {
    const { user } = context.req;
    return this.patientsService.create(createPatientDto, user.tenantId);
  }

  @Query(() => [Patient])
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async patients(@Context() context): Promise<Patient[]> {
    const { user } = context.req;
    return this.patientsService.findAll(user.tenantId);
  }

  @Query(() => Patient)
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async patient(
    @Args('id') id: string,
    @Context() context
  ): Promise<Patient> {
    const { user } = context.req;
    return this.patientsService.findOne(id, user.tenantId);
  }

  @Query(() => [Patient])
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async searchPatients(
    @Args('input') searchParams: SearchPatientDto,
    @Context() context
  ): Promise<Patient[]> {
    const { user } = context.req;
    return this.patientsService.search({
      ...searchParams,
      clinicId: user.tenantId
    });
  }

  @Mutation(() => Patient)
  @Roles(AuthUserRole.CLINIC_ADMIN, AuthUserRole.EMPLOYEE)
  async updatePatient(
    @Args('id') id: string,
    @Args('input') updatePatientDto: UpdatePatientDto,
    @Context() context
  ): Promise<Patient> {
    const { user } = context.req;
    return this.patientsService.update(id, updatePatientDto, user.tenantId);
  }

  @Mutation(() => Boolean)
  @Roles(AuthUserRole.CLINIC_ADMIN)
  async archivePatient(
    @Args('id') id: string,
    @Context() context
  ): Promise<boolean> {
    const { user } = context.req;
    await this.patientsService.archive(id, user.tenantId);
    return true;
  }
} 