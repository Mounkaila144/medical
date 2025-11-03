import { Encounter } from '../entities/encounter.entity';

export class EncounterLockedEvent {
  constructor(public readonly encounter: Encounter) {}
} 