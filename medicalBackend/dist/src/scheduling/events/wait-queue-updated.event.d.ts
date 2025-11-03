import { WaitQueueEntry } from '../entities/wait-queue-entry.entity';
export declare class WaitQueueUpdatedEvent {
    readonly tenantId: string;
    readonly entries: WaitQueueEntry[];
    constructor(tenantId: string, entries: WaitQueueEntry[]);
}
