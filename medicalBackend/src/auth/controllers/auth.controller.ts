import { Body, Controller, Post, Get, UseGuards, Request, HttpCode } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { JwtRefreshGuard } from '../../common/guards/jwt-refresh.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UsersService } from '../services/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto, @Request() req) {
    return this.authService.login(req.user);
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

} 