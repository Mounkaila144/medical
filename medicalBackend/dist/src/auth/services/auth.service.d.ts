import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Session } from '../entities/session.entity';
import { UsersService } from './users.service';
export declare class AuthService {
    private usersRepository;
    private sessionsRepository;
    private jwtService;
    private configService;
    private usersService;
    constructor(usersRepository: Repository<User>, sessionsRepository: Repository<Session>, jwtService: JwtService, configService: ConfigService, usersService: UsersService);
    validateUser(email: string, password: string): Promise<any>;
    login(user: any): Promise<{
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
    refresh(userId: string, refreshToken: string): Promise<{
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
    logout(userId: string, refreshToken: string): Promise<{
        success: boolean;
        removedSessions: number;
    }>;
    validateRefreshToken(userId: string, refreshToken: string): Promise<boolean>;
    private generateTokens;
}
