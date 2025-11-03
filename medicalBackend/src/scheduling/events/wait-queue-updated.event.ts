import { WaitQueueEntry } from '../entities/wait-queue-entry.entity';

export class WaitQueueUpdatedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly entries: WaitQueueEntry[],
  ) {}
} 