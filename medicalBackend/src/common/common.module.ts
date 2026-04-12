import { Module, Global } from '@nestjs/common';
import { MinioService } from './services/minio.service';
import { WhatsappNotificationService } from './services/whatsapp-notification.service';

@Global()
@Module({
  providers: [MinioService, WhatsappNotificationService],
  exports: [MinioService, WhatsappNotificationService],
})
export class CommonModule {}