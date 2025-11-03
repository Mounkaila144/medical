export declare enum Priority {
    LOW = "LOW",
    NORMAL = "NORMAL",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export declare enum QueueStatus {
    WAITING = "WAITING",
    CALLED = "CALLED",
    SERVING = "SERVING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare class WaitQueueEntry {
    id: string;
    tenantId: string;
    patientId?: string;
    practitionerId?: string;
    priority?: Priority;
    reason?: string;
    rank: number;
    ticketNumber: string;
    status: QueueStatus;
    calledAt: Date;
    createdAt: Date;
    servedAt: Date;
}
