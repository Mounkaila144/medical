import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DatabaseExceptionFilter } from './common/filters/database-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurer CORS dynamiquement via CORS_ORIGINS env var
  app.enableCors({
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
      : '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Accept,Authorization',
    exposedHeaders: 'X-Redirect-WhatsApp',
    credentials: true,
  });
  
  // Ajouter la validation globale des DTO
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Ajouter le filtre d'exception global pour les erreurs de base de données
  app.useGlobalFilters(new DatabaseExceptionFilter());
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
