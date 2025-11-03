import { Repository } from 'typeorm';
import { Supplier } from '../entities/supplier.entity';
import { Tenant } from '../../auth/entities/tenant.entity';
export declare class SupplierService {
    private supplierRepository;
    constructor(supplierRepository: Repository<Supplier>);
    create(name: string, contact: Record<string, any>, tenant: Tenant): Promise<Supplier>;
    list(tenantId: string): Promise<Supplier[]>;
}
