import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../src/auth/entities/user.entity';
import { Tenant } from '../src/auth/entities/tenant.entity';
import { Session } from '../src/auth/entities/session.entity';
import { AuthService } from '../src/auth/services/auth.service';
import { UsersService } from '../src/auth/services/users.service';
import { SuperadminService } from '../src/auth/services/superadmin.service';
import { AuthController } from '../src/auth/controllers/auth.controller';
import { AdminController } from '../src/auth/controllers/admin.controller';
import { UsersController } from '../src/auth/controllers/users.controller';
import { LocalStrategy } from '../src/auth/strategies/local.strategy';
import { JwtAccessStrategy } from '../src/auth/strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from '../src/auth/strategies/jwt-refresh.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: ':memory:',
        entities: [User, Tenant, Session],
        synchronize: true,
        logging: false,
      }),
    }),
    TypeOrmModule.forFeature([User, Tenant, Session]),
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
  controllers: [AuthController, AdminController, UsersController],
  providers: [
    AuthService,
    UsersService,
    SuperadminService,
    LocalStrategy,
    JwtAccessStrategy,
    JwtRefreshStrategy,
  ],
})
export class AuthTestModule {} 