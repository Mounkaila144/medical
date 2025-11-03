"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../entities/user.entity");
const session_entity_1 = require("../entities/session.entity");
const users_service_1 = require("./users.service");
let AuthService = class AuthService {
    usersRepository;
    sessionsRepository;
    jwtService;
    configService;
    usersService;
    constructor(usersRepository, sessionsRepository, jwtService, configService, usersService) {
        this.usersRepository = usersRepository;
        this.sessionsRepository = sessionsRepository;
        this.jwtService = jwtService;
        this.configService = configService;
        this.usersService = usersService;
    }
    async validateUser(email, password) {
        const user = await this.usersRepository.findOne({
            where: { email },
            relations: ['tenant']
        });
        if (!user) {
            return null;
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Ce compte a été désactivé');
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return null;
        }
        await this.usersRepository.update(user.id, {
            lastLogin: new Date(),
        });
        const { passwordHash, ...result } = user;
        return result;
    }
    async login(user) {
        return this.generateTokens(user);
    }
    async refresh(userId, refreshToken) {
        const isValid = await this.validateRefreshToken(userId, refreshToken);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Token de rafraîchissement invalide');
        }
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('Utilisateur non trouvé');
        }
        return this.generateTokens(user);
    }
    async logout(userId, refreshToken) {
        const sessions = await this.sessionsRepository.find({
            where: { userId },
        }) || [];
        let removedCount = 0;
        if (sessions && sessions.length > 0) {
            for (const session of sessions) {
                await this.sessionsRepository.remove(session);
                removedCount++;
            }
        }
        return { success: true, removedSessions: removedCount };
    }
    async validateRefreshToken(userId, refreshToken) {
        const sessions = await this.sessionsRepository.find({
            where: { userId },
        });
        for (const session of sessions) {
            const isValid = await bcrypt.compare(refreshToken, session.refreshTokenHash);
            if (isValid) {
                if (new Date() > session.expiresAt) {
                    await this.sessionsRepository.remove(session);
                    return false;
                }
                return true;
            }
        }
        return false;
    }
    async generateTokens(user) {
        const payload = { email: user.email, sub: user.id, role: user.role };
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_ACCESS_SECRET'),
            expiresIn: '15m',
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: '30d',
        });
        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await this.sessionsRepository.save({
            userId: user.id,
            refreshTokenHash,
            expiresAt,
        });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                tenantId: user.tenantId,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(session_entity_1.Session)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService,
        users_service_1.UsersService])
], AuthService);
//# sourceMappingURL=auth.service.js.map