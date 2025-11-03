import { WaitQueueService } from '../services/wait-queue.service';
import { UpdateWaitQueueEntryDto } from '../dto/update-wait-queue-entry.dto';
export declare class WaitQueueTestController {
    private readonly waitQueueService;
    constructor(waitQueueService: WaitQueueService);
    test(): {
        message: string;
    };
    testUpdate(entryId: string, updateData: UpdateWaitQueueEntryDto): Promise<{
        success: boolean;
        data: import("../entities/wait-queue-entry.entity").WaitQueueEntry;
        error?: undefined;
        type?: undefined;
    } | {
        success: boolean;
        error: any;
        type: any;
        data?: undefined;
    }>;
    testDelete(entryId: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
        type?: undefined;
    } | {
        success: boolean;
        error: any;
        type: any;
        message?: undefined;
    }>;
}
