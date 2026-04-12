import { Body, Controller, Post, Get, Patch, UseGuards, Request, HttpCode } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { JwtRefreshGuard } from '../../common/guards/jwt-refresh.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UsersService } from '../services/users.service';
import { PractitionerAuthService } from '../services/practitioner-auth.service';
import { AuthUserRole } from '../entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private practitionerAuthService: PractitionerAuthService
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto, @Request() req) {
    const authResult = await this.authService.login(req.user);

    // Détection automatique du type d'utilisateur basée sur le rôle
    if (req.user.role === AuthUserRole.PRACTITIONER) {
      // Récupérer les informations du praticien
      const practitioner = await this.practitionerAuthService.validatePractitioner(req.user.id);

      if (practitioner) {
        return {
          ...authResult,
          userType: 'practitioner',
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
    }

    // Pour tous les autres utilisateurs (SUPERADMIN, CLINIC_ADMIN, EMPLOYEE)
    return {
      ...authResult,
      userType: 'user',
    };
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('refresh')
  @HttpCode(200)
  async refresh(@CurrentUser() user) {
    return this.authService.refresh(user.id, user.refreshToken);
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  async logout(@Body() refreshTokenDto: RefreshTokenDto, @Request() req) {
    // On pourrait aussi utiliser un guard ici, mais pour la simplicité, nous ne le faisons pas
    try {
      const payload = this.authService['jwtService'].verify(
        refreshTokenDto.refreshToken,
        {
          secret: this.authService['configService'].get('JWT_REFRESH_SECRET'),
        },
      );
      return this.authService.logout(payload.sub, refreshTokenDto.refreshToken);
    } catch (e) {
      return { success: true };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @HttpCode(200)
  async getProfile(@CurrentUser() currentUser) {
    // Récupérer l'utilisateur avec ses relations
    const user = await this.usersService.findById(currentUser.id);

    // Retourner les informations utilisateur sans le mot de passe
    const { passwordHash, ...userProfile } = user;
    return userProfile;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @HttpCode(200)
  async updateProfile(@CurrentUser() currentUser, @Body() updateProfileDto: UpdateProfileDto) {
    return this.authService.updateProfile(currentUser.id, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(200)
  async changePassword(@CurrentUser() currentUser, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(currentUser.id, changePasswordDto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.code,
      resetPasswordDto.newPassword,
    );
  }
} 