import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { Patient } from './entities/patient.entity';
import { MedicalHistoryItem } from './entities/medical-history-item.entity';
import { ScannedDocument } from './entities/scanned-document.entity';

import { PatientsService } from './services/patients.service';
import { MedicalHistoryService } from './services/medical-history.service';
import { DocumentsService } from './services/documents.service';
import { WhatsappService } from './services/whatsapp.service';

import { PatientsController } from './controllers/patients.controller';
import { MedicalHistoryController } from './controllers/medical-history.controller';
import { DocumentsController } from './controllers/documents.controller';
import { PublicPatientsController } from './controllers/public-patients.controller';

import { PatientsResolver } from './resolvers/patients.resolver';
import { MedicalHistoryResolver } from './resolvers/medical-history.resolver';
import { DocumentsResolver } from './resolvers/documents.resolver';

// Import du module d'authentification
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, MedicalHistoryItem, ScannedDocument]),
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB max file size
      },
    }),
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'patients_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    // Import explicite du module d'authentification
    AuthModule,
  ],
  controllers: [
    PatientsController,
    MedicalHistoryController,
    DocumentsController,
    PublicPatientsController,
  ],
  providers: [
    PatientsService,
    MedicalHistoryService,
    DocumentsService,
    WhatsappService,
    PatientsResolver,
    MedicalHistoryResolver,
    DocumentsResolver,
  ],
  exports: [PatientsService, MedicalHistoryService, DocumentsService],
})
export class PatientsModule {}
