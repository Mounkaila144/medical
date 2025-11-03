import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { UsersService } from '../services/users.service';
export declare class AuthController {
    private authService;
    private usersService;
    constructor(authService: AuthService, usersService: UsersService);
    login(loginDto: LoginDto, req: any): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            role: any;
            firstName: any;
            lastName: any;
            tenantId: any;
        };
    }>;
    refresh(user: any): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            role: any;
            firstName: any;
            lastName: any;
            tenantId: any;
        };
    }>;
    logout(refreshTokenDto: RefreshTokenDto, req: any): Promise<{
        success: boolean;
        removedSessions: number;
    } | {
        success: boolean;
    }>;
    getProfile(currentUser: any): Promise<{
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
