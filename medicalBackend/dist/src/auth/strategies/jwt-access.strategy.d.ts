import { ConfigService } from '@nestjs/config';
import { UsersService } from '../services/users.service';
declare const JwtAccessStrategy_base: new (...args: any) => any;
export declare class JwtAccessStrategy extends JwtAccessStrategy_base {
    private readonly configService;
    private readonly usersService;
    constructor(configService: ConfigService, usersService: UsersService);
    validate(payload: any): Promise<{
        id: string;
        tenant: import("../entities/tenant.entity").Tenant;
        tenantId: string;
        email: string;
        role: import("../entities/user.entity").AuthUserRole;
        firstName: string;
        lastName: string;
        isActive: boolean;
        lastLogin: Date;
        createdAt: Date;
        updatedAt: Date;
        sessions: import("../entities/session.entity").Session[];
    }>;
}
export {};
