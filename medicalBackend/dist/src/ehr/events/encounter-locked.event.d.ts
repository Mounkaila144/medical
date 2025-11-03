import { Encounter } from '../entities/encounter.entity';
export declare class EncounterLockedEvent {
    readonly encounter: Encounter;
    constructor(encounter: Encounter);
}
