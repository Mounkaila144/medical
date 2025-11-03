import { EncountersService } from '../services/encounters.service';
import { CreateEncounterDto } from '../dto/create-encounter.dto';
import { UpdateEncounterDto } from '../dto/update-encounter.dto';
import { LockEncounterDto } from '../dto/lock-encounter.dto';
export declare class EncountersController {
    private readonly encountersService;
    constructor(encountersService: EncountersService);
    create(createEncounterDto: CreateEncounterDto, req: any): Promise<import("../entities").Encounter>;
    findAll(req: any): Promise<import("../entities").Encounter[]>;
    findOne(id: string): Promise<import("../entities").Encounter>;
    update(updateEncounterDto: UpdateEncounterDto, req: any): Promise<import("../entities").Encounter>;
    lock(lockEncounterDto: LockEncounterDto, req: any): Promise<import("../entities").Encounter>;
}
