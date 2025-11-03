export declare enum ReportFormat {
    PDF = "PDF",
    CSV = "CSV"
}
export declare class Report {
    id: string;
    tenantId: string;
    name: string;
    params: Record<string, any>;
    generatedPath: string;
    format: ReportFormat;
    createdAt: Date;
}
