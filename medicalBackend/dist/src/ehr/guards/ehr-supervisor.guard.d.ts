import { CanActivate, ExecutionContext } from '@nestjs/common';
import { EncountersService } from '../services/encounters.service';
export declare class EHRSupervisorGuard implements CanActivate {
    private readonly encountersService;
    constructor(encountersService: EncountersService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
