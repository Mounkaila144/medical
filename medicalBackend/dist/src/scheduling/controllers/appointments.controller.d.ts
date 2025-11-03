import { SchedulingService } from '../services/scheduling.service';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { RescheduleAppointmentDto } from '../dto/reschedule-appointment.dto';
import { CancelAppointmentDto } from '../dto/cancel-appointment.dto';
import { Appointment } from '../entities/appointment.entity';
export declare class AppointmentsController {
    private readonly schedulingService;
    constructor(schedulingService: SchedulingService);
    test(): Promise<{
        message: string;
    }>;
    debug(): Promise<{
        message: string;
    }>;
    create(tenantId: string, createAppointmentDto: CreateAppointmentDto): Promise<Appointment>;
    getAll(tenantId: string, dateString?: string, practitionerId?: string): Promise<Appointment[]>;
    getById(tenantId: string, appointmentId: string): Promise<Appointment>;
    update(tenantId: string, appointmentId: string, updateData: Partial<CreateAppointmentDto>): Promise<Appointment>;
    reschedule(tenantId: string, rescheduleDto: RescheduleAppointmentDto): Promise<Appointment>;
    cancel(tenantId: string, appointmentId: string, cancelDto: CancelAppointmentDto): Promise<Appointment>;
    cancelPatch(tenantId: string, appointmentId: string, cancelDto: CancelAppointmentDto): Promise<Appointment>;
    getPractitionerAppointments(tenantId: string, practitionerId: string, dateString: string): Promise<Appointment[]>;
}
