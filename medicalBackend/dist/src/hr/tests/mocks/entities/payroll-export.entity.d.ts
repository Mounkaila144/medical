import { Tenant } from './tenant.entity';
export declare class PayrollExport {
    id: string;
    tenantId: string;
    tenant: Tenant;
    period: string;
    filePath: string;
    generatedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
