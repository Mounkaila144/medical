import { SchedulingService } from '../services/scheduling.service';
import { PractitionerAuthService } from '../../auth/services/practitioner-auth.service';
import { Appointment } from '../entities/appointment.entity';
export declare class PractitionerScheduleController {
    private readonly schedulingService;
    private readonly practitionerAuthService;
    constructor(schedulingService: SchedulingService, practitionerAuthService: PractitionerAuthService);
    getMyAppointments(user: any, dateString?: string): Promise<Appointment[]>;
    getMyWeeklyAppointments(user: any, startDateString?: string): Promise<Appointment[]>;
    getMyMonthlyAppointments(user: any, year?: number, month?: number): Promise<Appointment[]>;
    getMyAppointment(user: any, appointmentId: string): Promise<Appointment>;
    getMyAvailability(user: any, dateString?: string): Promise<Array<{
        startAt: Date;
        endAt: Date;
        duration: number;
        available: boolean;
    }>>;
    getMyStats(user: any, startDateString?: string, endDateString?: string): Promise<{
        totalAppointments: number;
        appointmentsByStatus: {};
        appointmentsByUrgency: {};
        practitioner: {
            id: string;
            firstName: string;
            lastName: string;
            specialty: string;
        };
    }>;
}
