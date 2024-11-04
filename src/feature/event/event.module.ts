import { Module } from '@nestjs/common';
import { WsJwtAuthGuard } from '../auth/guards/jwt.guard/ws.jwt.auth.guard';
import { AuthHelper } from 'src/core/helpers/auth.helper';
import { MessageGateway } from './message.gateway';
import { EventService } from './event.service';
import { Paginator } from 'src/core/helpers/paginator';
import { EventGateway } from './event.gateway';
import { NotificationModule } from '../notification/notification.module';
import { CommunityModule } from '../community/community.module';

@Module({
  providers: [EventGateway, MessageGateway, WsJwtAuthGuard, AuthHelper, EventService, Paginator],
  imports: [
    NotificationModule,
    CommunityModule
  ]
})
export class EventModule { }
