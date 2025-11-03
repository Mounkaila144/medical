import { SuperadminService } from '../services/superadmin.service';
import { CreateTenantDto } from '../dto/create-tenant.dto';
export declare class AdminController {
    private superadminService;
    constructor(superadminService: SuperadminService);
    findAllTenants(): Promise<import("../entities/tenant.entity").Tenant[]>;
    createTenant(createTenantDto: CreateTenantDto): Promise<import("../entities/tenant.entity").Tenant>;
    deactivateTenant(id: string): Promise<import("../entities/tenant.entity").Tenant>;
    reactivateTenant(id: string): Promise<import("../entities/tenant.entity").Tenant>;
}
