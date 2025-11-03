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
exports.PractitionerAuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../services/auth.service");
const local_auth_guard_1 = require("../../common/guards/local-auth.guard");
const jwt_refresh_guard_1 = require("../../common/guards/jwt-refresh.guard");
const login_dto_1 = require("../dto/login.dto");
const refresh_token_dto_1 = require("../dto/refresh-token.dto");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const practitioner_auth_service_1 = require("../services/practitioner-auth.service");
let PractitionerAuthController = class PractitionerAuthController {
    authService;
    practitionerAuthService;
    constructor(authService, practitionerAuthService) {
        this.authService = authService;
        this.practitionerAuthService = practitionerAuthService;
    }
    async login(loginDto, req) {
        const practitioner = await this.practitionerAuthService.validatePractitioner(req.user.id);
        if (!practitioner) {
            throw new Error('Accès refusé : vous devez être un praticien pour accéder à cette interface');
        }
        const authResult = await this.authService.login(req.user);
        return {
            ...authResult,
            practitioner: {
                id: practitioner.id,
                firstName: practitioner.firstName,
                lastName: practitioner.lastName,
                specialty: practitioner.specialty,
                color: practitioner.color,
            },
        };
    }
    async refresh(user) {
        return this.authService.refresh(user.id, user.refreshToken);
    }
    async logout(refreshTokenDto, req) {
        try {
            const payload = this.authService['jwtService'].verify(refreshTokenDto.refreshToken, {
                secret: this.authService['configService'].get('JWT_REFRESH_SECRET'),
            });
            return this.authService.logout(payload.sub, refreshTokenDto.refreshToken);
        }
        catch (e) {
            return { success: true };
        }
    }
    async getProfile(user) {
        const practitioner = await this.practitionerAuthService.getPractitionerByUserId(user.id);
        if (!practitioner) {
            throw new Error('Praticien non trouvé');
        }
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
            practitioner: {
                id: practitioner.id,
                firstName: practitioner.firstName,
                lastName: practitioner.lastName,
                specialty: practitioner.specialty,
                color: practitioner.color,
                tenantId: practitioner.tenantId,
            },
        };
    }
};
exports.PractitionerAuthController = PractitionerAuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.UseGuards)(local_auth_guard_1.LocalAuthGuard),
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], PractitionerAuthController.prototype, "login", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.UseGuards)(jwt_refresh_guard_1.JwtRefreshGuard),
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PractitionerAuthController.prototype, "refresh", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_token_dto_1.RefreshTokenDto, Object]),
    __metadata("design:returntype", Promise)
], PractitionerAuthController.prototype, "logout", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('profile'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PractitionerAuthController.prototype, "getProfile", null);
exports.PractitionerAuthController = PractitionerAuthController = __decorate([
    (0, common_1.Controller)('auth/practitioner'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        practitioner_auth_service_1.PractitionerAuthService])
], PractitionerAuthController);
//# sourceMappingURL=practitioner-auth.controller.js.map