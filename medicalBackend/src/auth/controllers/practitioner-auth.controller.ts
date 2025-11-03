import { Body, Controller, Post, UseGuards, Request, HttpCode, Get } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { JwtRefreshGuard } from '../../common/guards/jwt-refresh.guard';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PractitionerAuthService } from '../services/practitioner-auth.service';

@Controller('auth/practitioner')
export class PractitionerAuthController {
  constructor(
    private authService: AuthService,
    private practitionerAuthService: PractitionerAuthService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto, @Request() req) {
    // Vérifier que l'utilisateur est bien un praticien
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

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(200)
  async refresh(@CurrentUser() user) {
    return this.authService.refresh(user.id, user.refreshToken);
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  async logout(@Body() refreshTokenDto: RefreshTokenDto, @Request() req) {
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
  async getProfile(@CurrentUser() user) {
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
} 