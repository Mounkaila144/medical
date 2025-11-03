import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SchedulingService } from '../services/scheduling.service';
import { PractitionerAuthService } from '../../auth/services/practitioner-auth.service';
import { Appointment } from '../entities/appointment.entity';

@Controller('practitioner/schedule')
@UseGuards(JwtAuthGuard)
export class PractitionerScheduleController {
  constructor(
    private readonly schedulingService: SchedulingService,
    private readonly practitionerAuthService: PractitionerAuthService,
  ) {}

  @Get('appointments')
  async getMyAppointments(
    @CurrentUser() user,
    @Query('date') dateString?: string,
  ): Promise<Appointment[]> {
    // Récupérer le praticien associé à l'utilisateur connecté
    const practitioner = await this.practitionerAuthService.getPractitionerByUserId(user.id);
    
    if (dateString) {
      const date = new Date(dateString);
      return this.schedulingService.listAgenda(practitioner.tenantId, practitioner.id, date);
    }
    
    // Si aucune date spécifiée, retourner les rendez-vous d'aujourd'hui
    const today = new Date();
    return this.schedulingService.listAgenda(practitioner.tenantId, practitioner.id, today);
  }

  @Get('appointments/week')
  async getMyWeeklyAppointments(
    @CurrentUser() user,
    @Query('startDate') startDateString?: string,
  ): Promise<Appointment[]> {
    const practitioner = await this.practitionerAuthService.getPractitionerByUserId(user.id);
    
    const startDate = startDateString ? new Date(startDateString) : new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);
    
    return this.schedulingService.getAppointmentsByDateRange(
      practitioner.tenantId,
      practitioner.id,
      startDate,
      endDate,
    );
  }

  @Get('appointments/month')
  async getMyMonthlyAppointments(
    @CurrentUser() user,
    @Query('year') year?: number,
    @Query('month') month?: number,
  ): Promise<Appointment[]> {
    const practitioner = await this.practitionerAuthService.getPractitionerByUserId(user.id);
    
    const currentDate = new Date();
    const targetYear = year || currentDate.getFullYear();
    const targetMonth = month || currentDate.getMonth() + 1;
    
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);
    
    return this.schedulingService.getAppointmentsByDateRange(
      practitioner.tenantId,
      practitioner.id,
      startDate,
      endDate,
    );
  }

  @Get('appointments/:id')
  async getMyAppointment(
    @CurrentUser() user,
    @Param('id') appointmentId: string,
  ): Promise<Appointment> {
    const practitioner = await this.practitionerAuthService.getPractitionerByUserId(user.id);
    
    const appointment = await this.schedulingService.getAppointmentById(
      practitioner.tenantId,
      appointmentId,
    );
    
    // Vérifier que le rendez-vous appartient bien au praticien connecté
    if (appointment.practitionerId !== practitioner.id) {
      throw new Error('Vous n\'avez pas accès à ce rendez-vous');
    }
    
    return appointment;
  }

  @Get('availability')
  async getMyAvailability(
    @CurrentUser() user,
    @Query('date') dateString?: string,
  ): Promise<Array<{
    startAt: Date;
    endAt: Date;
    duration: number;
    available: boolean;
  }>> {
    const practitioner = await this.practitionerAuthService.getPractitionerByUserId(user.id);
    
    // Ici, vous devrez implémenter la méthode dans SchedulingService
    // pour récupérer les disponibilités d'un praticien
    return this.schedulingService.getPractitionerAvailability(
      practitioner.tenantId,
      practitioner.id,
      dateString ? new Date(dateString) : undefined,
    );
  }

  @Get('stats')
  async getMyStats(
    @CurrentUser() user,
    @Query('startDate') startDateString?: string,
    @Query('endDate') endDateString?: string,
  ) {
    const practitioner = await this.practitionerAuthService.getPractitionerByUserId(user.id);
    
    const startDate = startDateString ? new Date(startDateString) : new Date();
    const endDate = endDateString ? new Date(endDateString) : new Date();
    
    // Si aucune date de fin spécifiée, prendre la fin du mois
    if (!endDateString) {
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
    }
    
    const appointments = await this.schedulingService.getAppointmentsByDateRange(
      practitioner.tenantId,
      practitioner.id,
      startDate,
      endDate,
    );
    
    return {
      totalAppointments: appointments.length,
      appointmentsByStatus: appointments.reduce((acc, appointment) => {
        acc[appointment.status] = (acc[appointment.status] || 0) + 1;
        return acc;
      }, {}),
      appointmentsByUrgency: appointments.reduce((acc, appointment) => {
        acc[appointment.urgency] = (acc[appointment.urgency] || 0) + 1;
        return acc;
      }, {}),
      practitioner: {
        id: practitioner.id,
        firstName: practitioner.firstName,
        lastName: practitioner.lastName,
        specialty: practitioner.specialty,
      },
    };
  }
} 