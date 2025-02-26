import { Module } from '@nestjs/common';
import { EventGateway } from './event.gateway';
import { NotificationModule } from '../notification/notification.module';
import { CommunityModule } from '../community/community.module';

@Module({
  providers: [EventGateway],
  imports: [
    NotificationModule,
    CommunityModule
  ]
})

export class EventModule { }
