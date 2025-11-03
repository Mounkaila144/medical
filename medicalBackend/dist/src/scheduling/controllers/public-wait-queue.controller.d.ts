import { WaitQueueService } from '../services/wait-queue.service';
import { WaitQueueEntry } from '../entities/wait-queue-entry.entity';
import { Priority } from '../entities/wait-queue-entry.entity';
interface TakeNumberDto {
    reason?: string;
    priority?: Priority;
}
export declare class PublicWaitQueueController {
    private readonly waitQueueService;
    constructor(waitQueueService: WaitQueueService);
    takeNumber(data: TakeNumberDto, tenantId?: string): Promise<WaitQueueEntry>;
    getQueue(tenantId?: string): Promise<WaitQueueEntry[]>;
    getCurrentlyServing(tenantId?: string): Promise<WaitQueueEntry | null>;
}
export {};
