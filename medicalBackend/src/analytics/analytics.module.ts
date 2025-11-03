import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Report } from './entities';
import { AnalyticsService } from './services';
import { ReportsController } from './controllers';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report]),
    ConfigModule,
  ],
  controllers: [ReportsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {} 