export declare enum Priority {
    LOW = "LOW",
    NORMAL = "NORMAL",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export declare class CreateWaitQueueEntryDto {
    patientId?: string;
    practitionerId?: string;
    priority?: Priority;
    reason?: string;
}
