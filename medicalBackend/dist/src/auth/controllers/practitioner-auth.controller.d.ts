import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { PractitionerAuthService } from '../services/practitioner-auth.service';
export declare class PractitionerAuthController {
    private authService;
    private practitionerAuthService;
    constructor(authService: AuthService, practitionerAuthService: PractitionerAuthService);
    login(loginDto: LoginDto, req: any): Promise<{
        practitioner: {
            id: string;
            firstName: string;
            lastName: string;
            specialty: string;
            color: string;
        };
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
    getProfile(user: any): Promise<{
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            role: any;
        };
        practitioner: {
            id: string;
            firstName: string;
            lastName: string;
            specialty: string;
            color: string;
            tenantId: string;
        };
    }>;
}
