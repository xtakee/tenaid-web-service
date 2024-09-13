import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { GoogleService } from 'src/services/google/google.service';
import { CacheService } from 'src/services/cache/cache.service';
import { BullModule } from '@nestjs/bullmq/dist/bull.module';
import { NotificationProcessor } from './consumer/notification.processor';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, GoogleService, CacheService, NotificationProcessor],
  imports: [BullModule.registerQueue({
    name: 'notification',
  })]
})
export class NotificationModule {}
