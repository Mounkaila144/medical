import { WaitQueueService } from '../services/wait-queue.service';
import { WaitQueueEntry } from '../entities/wait-queue-entry.entity';
import { CreateWaitQueueEntryDto } from '../dto/create-wait-queue-entry.dto';
import { UpdateWaitQueueEntryDto } from '../dto/update-wait-queue-entry.dto';
export declare class WaitQueueController {
    private readonly waitQueueService;
    constructor(waitQueueService: WaitQueueService);
    addToQueue(tenantId: string, createDto: CreateWaitQueueEntryDto): Promise<WaitQueueEntry>;
    enqueue(tenantId: string, createDto: CreateWaitQueueEntryDto): Promise<WaitQueueEntry>;
    callNext(tenantId: string): Promise<WaitQueueEntry | null>;
    getQueue(tenantId: string): Promise<WaitQueueEntry[]>;
    getCurrentlyServing(tenantId: string): Promise<WaitQueueEntry | null>;
    markAsServing(tenantId: string, entryId: string): Promise<WaitQueueEntry>;
    complete(tenantId: string, entryId: string): Promise<void>;
    updateEntry(tenantId: string, entryId: string, updateData: UpdateWaitQueueEntryDto): Promise<WaitQueueEntry>;
    removeEntry(tenantId: string, entryId: string): Promise<void>;
}
