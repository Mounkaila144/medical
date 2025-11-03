import { Args, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { SchedulingService } from '../services/scheduling.service';
import { Appointment } from '../entities/appointment.entity';
import { AgendaDto } from '../dto/agenda.dto';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Resolver(() => AgendaDto)
@UseGuards(JwtAuthGuard, GqlAuthGuard, TenantGuard)
export class AgendaResolver {
  constructor(private readonly schedulingService: SchedulingService) {}

  @Query(() => AgendaDto)
  async agenda(
    @TenantId() tenantId: string,
    @Args('practitionerId') practitionerId: string,
    @Args('date') dateString: string,
  ): Promise<AgendaDto> {
    const date = new Date(dateString);
    const appointments = await this.schedulingService.listAgenda(
      tenantId, 
      practitionerId, 
      date
    );

    return {
      date: dateString,
      appointments,
    };
  }
} 