import { EncountersService } from '../services/encounters.service';
import { Encounter } from '../entities/encounter.entity';
import { CreateEncounterDto } from '../dto/create-encounter.dto';
import { UpdateEncounterDto } from '../dto/update-encounter.dto';
import { LockEncounterDto } from '../dto/lock-encounter.dto';
export declare class EncountersResolver {
    private readonly encountersService;
    constructor(encountersService: EncountersService);
    createEncounter(createEncounterDto: CreateEncounterDto, context: any): Promise<Encounter>;
    encounters(context: any): Promise<Encounter[]>;
    encounter(id: string): Promise<Encounter>;
    updateEncounter(updateEncounterDto: UpdateEncounterDto, context: any): Promise<Encounter>;
    lockEncounter(lockEncounterDto: LockEncounterDto, context: any): Promise<Encounter>;
}
