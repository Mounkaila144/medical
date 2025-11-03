import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { PatientsModule } from './patients/patients.module';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { EhrModule } from './ehr/ehr.module';
import { BillingModule } from './billing/billing.module';
import { InventoryModule } from './inventory/inventory.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HrModule } from './hr/hr.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.test'],
    }),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Pour les tests, utiliser SQLite en mémoire si configuré
        const dbType = configService.get<string>('DATABASE_TYPE') || configService.get<string>('DB_TYPE') || 'postgres';
        
        if (dbType === 'sqlite') {
          return {
            type: 'sqlite',
            database: configService.get<string>('DATABASE_MEMORY') === 'true' ? ':memory:' : 'db.sqlite',
            entities: [
              __dirname + '/auth/entities/*.entity{.ts,.js}',
              __dirname + '/patients/entities/*.entity{.ts,.js}',
              __dirname + '/scheduling/entities/*.entity{.ts,.js}',
              __dirname + '/ehr/entities/*.entity{.ts,.js}',
              __dirname + '/billing/entities/*.entity{.ts,.js}',
              __dirname + '/inventory/entities/*.entity{.ts,.js}',
              __dirname + '/hr/entities/*.entity{.ts,.js}',
              __dirname + '/analytics/entities/*.entity{.ts,.js}',
            ],
            synchronize: true,
            logging: configService.get<string>('NODE_ENV') !== 'production',
          };
        }
        
        if (dbType === 'mysql') {
          return {
            type: 'mysql',
            host: configService.get<string>('DATABASE_HOST') || configService.get<string>('DB_HOST', 'localhost'),
            port: configService.get<number>('DATABASE_PORT') || configService.get<number>('DB_PORT', 3306),
            username: configService.get<string>('DATABASE_USERNAME') || configService.get<string>('DB_USERNAME', 'root'),
            password: configService.get<string>('DATABASE_PASSWORD') || configService.get<string>('DB_PASSWORD', ''),
            database: configService.get<string>('DATABASE_NAME') || configService.get<string>('DB_NAME', 'medical'),
            entities: [
              __dirname + '/auth/entities/*.entity{.ts,.js}',
              __dirname + '/patients/entities/*.entity{.ts,.js}',
              __dirname + '/scheduling/entities/*.entity{.ts,.js}',
              __dirname + '/ehr/entities/*.entity{.ts,.js}',
              __dirname + '/billing/entities/*.entity{.ts,.js}',
              __dirname + '/inventory/entities/*.entity{.ts,.js}',
              __dirname + '/hr/entities/*.entity{.ts,.js}',
              __dirname + '/analytics/entities/*.entity{.ts,.js}',
            ],
            synchronize: configService.get<string>('NODE_ENV') !== 'production',
            logging: configService.get<string>('NODE_ENV') !== 'production',
          } as TypeOrmModuleOptions;
        }
        
        // Configuration PostgreSQL par défaut
        return {
          type: 'postgres',
          host: configService.get<string>('DATABASE_HOST') || configService.get<string>('DB_HOST'),
          port: configService.get<number>('DATABASE_PORT') || configService.get<number>('DB_PORT', 5432),
          username: configService.get<string>('DATABASE_USERNAME') || configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DATABASE_PASSWORD') || configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DATABASE_NAME') || configService.get<string>('DB_NAME'),
          entities: [
            __dirname + '/auth/entities/*.entity{.ts,.js}',
            __dirname + '/patients/entities/*.entity{.ts,.js}',
            __dirname + '/scheduling/entities/*.entity{.ts,.js}',
            __dirname + '/ehr/entities/*.entity{.ts,.js}',
            __dirname + '/billing/entities/*.entity{.ts,.js}',
            __dirname + '/inventory/entities/*.entity{.ts,.js}',
            __dirname + '/hr/entities/*.entity{.ts,.js}',
            __dirname + '/analytics/entities/*.entity{.ts,.js}',
          ],
          synchronize: configService.get<string>('NODE_ENV') !== 'production',
          logging: configService.get<string>('NODE_ENV') !== 'production',
          ssl: false,
        };
      },
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
    }),
    PatientsModule,
    AuthModule,
    SchedulingModule,
    EhrModule,
    BillingModule,
    InventoryModule,
    HrModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
