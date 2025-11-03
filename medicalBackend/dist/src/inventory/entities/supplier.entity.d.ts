import { Tenant } from '../../auth/entities/tenant.entity';
export declare class Supplier {
    id: string;
    tenant: Tenant;
    name: string;
    contact: Record<string, any>;
}
