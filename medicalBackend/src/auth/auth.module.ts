import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Entités
import { User } from './entities/user.entity';
import { Tenant } from './entities/tenant.entity';
import { Session } from './entities/session.entity';
import { Practitioner } from '../scheduling/entities/practitioner.entity';

// Services
import { AuthService } from './services/auth.service';
import { UsersService } from './services/users.service';
import { SuperadminService } from './services/superadmin.service';
import { PractitionerAuthService } from './services/practitioner-auth.service';

// Contrôleurs
import { AuthController } from './controllers/auth.controller';
import { AdminController } from './controllers/admin.controller';
import { UsersController } from './controllers/users.controller';
import { PractitionerAuthController } from './controllers/practitioner-auth.controller';

// Stratégies
import { LocalStrategy } from './strategies/local.strategy';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

// Guards
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { GqlRolesGuard } from './guards/gql-roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Tenant, Session, Practitioner]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController, AdminController, UsersController, PractitionerAuthController],
  providers: [
    AuthService,
    UsersService,
    SuperadminService,
    PractitionerAuthService,
    LocalStrategy,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    JwtAuthGuard,
    RolesGuard,
    GqlRolesGuard,
  ],
  exports: [
    AuthService, 
    UsersService, 
    SuperadminService, 
    PractitionerAuthService,
    JwtAuthGuard, 
    RolesGuard, 
    GqlRolesGuard
  ],
})
export class AuthModule {} 