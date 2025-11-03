export declare class PayrollExportDto {
    id: string;
    tenantId: string;
    period: string;
    filePath: string;
    generatedAt: Date;
}
export declare class CreatePayrollExportInput {
    tenantId: string;
    period: string;
}
