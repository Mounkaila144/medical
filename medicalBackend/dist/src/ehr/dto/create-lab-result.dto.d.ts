export declare class CreateLabResultDto {
    patientId: string;
    encounterId?: string;
    labName: string;
    result: Record<string, any>;
    filePath?: string;
    receivedAt: Date;
}
