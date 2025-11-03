import { Repository } from 'typeorm';
import { Encounter } from '../entities/encounter.entity';
import { CreateEncounterDto } from '../dto/create-encounter.dto';
import { UpdateEncounterDto } from '../dto/update-encounter.dto';
import { LockEncounterDto } from '../dto/lock-encounter.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class EncountersService {
    private encountersRepository;
    private eventEmitter;
    constructor(encountersRepository: Repository<Encounter>, eventEmitter: EventEmitter2);
    create(tenantId: string, createEncounterDto: CreateEncounterDto): Promise<Encounter>;
    findAll(tenantId: string): Promise<Encounter[]>;
    findOne(id: string): Promise<Encounter>;
    update(tenantId: string, updateEncounterDto: UpdateEncounterDto): Promise<Encounter>;
    lock(tenantId: string, lockEncounterDto: LockEncounterDto): Promise<Encounter>;
}
