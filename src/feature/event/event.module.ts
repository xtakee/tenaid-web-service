import { Module } from '@nestjs/common';
import { EventGateway } from './event.gateway';
import { NotificationModule } from '../notification/notification.module';
import { CommunityModule } from '../community/community.module';
import { WsJwtAuthGuard } from '../auth/guards/jwt.guard/ws.jwt.auth.guard';
import { AuthHelper } from 'src/core/helpers/auth.helper';

@Module({
  providers: [EventGateway, WsJwtAuthGuard, AuthHelper],
  imports: [
    NotificationModule,
    CommunityModule
  ]
})

export class EventModule { }
