import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsersService } from '../services/users.service';
import { AuthService } from '../services/auth.service';
declare const JwtRefreshStrategy_base: new (...args: any) => any;
export declare class JwtRefreshStrategy extends JwtRefreshStrategy_base {
    private readonly configService;
    private readonly usersService;
    private readonly authService;
    constructor(configService: ConfigService, usersService: UsersService, authService: AuthService);
    validate(req: Request, payload: any): Promise<{
        refreshToken: string;
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
