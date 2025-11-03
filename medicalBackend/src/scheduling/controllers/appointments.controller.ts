import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, Patch } from '@nestjs/common';

import { SchedulingService } from '../services/scheduling.service';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { RescheduleAppointmentDto } from '../dto/reschedule-appointment.dto';
import { CancelAppointmentDto } from '../dto/cancel-appointment.dto';
import { Appointment } from '../entities/appointment.entity';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('appointments')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AppointmentsController {
  constructor(private readonly schedulingService: SchedulingService) {}

  @Get('test')
  async test(): Promise<{ message: string }> {
    return { message: 'Appointments controller is working' };
  }

  @Get('debug')
  async debug(): Promise<{ message: string }> {
    try {
      return { message: 'Debug endpoint working' };
    } catch (error) {
      return { message: `Error: ${error.message}` };
    }
  }

  @Post()
  async create(
    @TenantId() tenantId: string,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    console.log('Creating appointment with data:', {
      tenantId,
      ...createAppointmentDto,
    });
    return await this.schedulingService.book(tenantId, createAppointmentDto);
  }

  @Get()
  async getAll(
    @TenantId() tenantId: string,
    @Query('date') dateString?: string,
    @Query('practitionerId') practitionerId?: string,
  ): Promise<Appointment[]> {
    if (practitionerId && dateString) {
      const date = new Date(dateString);
      return this.schedulingService.listAgenda(tenantId, practitionerId, date);
    }
    // If no specific filters, return all appointments for the tenant
    return this.schedulingService.getAllAppointments(tenantId, dateString);
  }

  @Get(':id')
  async getById(
    @TenantId() tenantId: string,
    @Param('id') appointmentId: string,
  ): Promise<Appointment> {
    return this.schedulingService.getAppointmentById(tenantId, appointmentId);
  }

  @Patch(':id')
  async update(
    @TenantId() tenantId: string,
    @Param('id') appointmentId: string,
    @Body() updateData: Partial<CreateAppointmentDto>,
  ): Promise<Appointment> {
    return this.schedulingService.updateAppointment(tenantId, appointmentId, updateData);
  }

  @Put('reschedule')
  async reschedule(
    @TenantId() tenantId: string,
    @Body() rescheduleDto: RescheduleAppointmentDto,
  ): Promise<Appointment> {
    return this.schedulingService.reschedule(tenantId, rescheduleDto);
  }

  @Post(':id/cancel')
  async cancel(
    @TenantId() tenantId: string,
    @Param('id') appointmentId: string,
    @Body() cancelDto: CancelAppointmentDto,
  ): Promise<Appointment> {
    return this.schedulingService.cancel(tenantId, appointmentId, cancelDto);
  }

  @Patch(':id/cancel')
  async cancelPatch(
    @TenantId() tenantId: string,
    @Param('id') appointmentId: string,
    @Body() cancelDto: CancelAppointmentDto,
  ): Promise<Appointment> {
    return this.schedulingService.cancel(tenantId, appointmentId, cancelDto);
  }

  @Get('practitioner/:practitionerId')
  async getPractitionerAppointments(
    @TenantId() tenantId: string,
    @Param('practitionerId') practitionerId: string,
    @Query('date') dateString: string,
  ): Promise<Appointment[]> {
    const date = dateString ? new Date(dateString) : new Date();
    return this.schedulingService.listAgenda(tenantId, practitionerId, date);
  }
} 