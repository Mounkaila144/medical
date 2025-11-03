export declare class MinioService {
    private readonly minioClient;
    constructor();
    ensureBucketExists(bucketName: string): Promise<void>;
    uploadBuffer(bucketName: string, objectName: string, buffer: Buffer, contentType: string, metadata?: Record<string, string>): Promise<void>;
    uploadFile(bucketName: string, objectName: string, filePath: string, contentType: string, metadata?: Record<string, string>): Promise<void>;
    getPresignedUrl(bucketName: string, objectName: string, expiry?: number): Promise<string>;
    getObject(bucketName: string, objectName: string): Promise<NodeJS.ReadableStream>;
    removeObject(bucketName: string, objectName: string): Promise<void>;
    objectExists(bucketName: string, objectName: string): Promise<boolean>;
}
