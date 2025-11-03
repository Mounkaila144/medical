import { SchedulingService } from '../services/scheduling.service';
import { AgendaDto } from '../dto/agenda.dto';
export declare class AgendaResolver {
    private readonly schedulingService;
    constructor(schedulingService: SchedulingService);
    agenda(tenantId: string, practitionerId: string, dateString: string): Promise<AgendaDto>;
}
