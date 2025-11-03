import { Repository } from 'typeorm';
import { Tenant } from '../entities/tenant.entity';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { UsersService } from './users.service';
export declare class SuperadminService {
    private tenantsRepository;
    private usersService;
    constructor(tenantsRepository: Repository<Tenant>, usersService: UsersService);
    createTenantWithAdmin(createTenantDto: CreateTenantDto): Promise<Tenant>;
    findAllTenants(): Promise<Tenant[]>;
    findTenantById(id: string): Promise<Tenant>;
    deactivateTenant(id: string): Promise<Tenant>;
    reactivateTenant(id: string): Promise<Tenant>;
}
