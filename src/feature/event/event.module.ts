import { Module } from '@nestjs/common';
import { EventGateway } from './event.gateway';
import { WsJwtAuthGuard } from '../auth/guards/jwt.guard/ws.jwt.auth.guard';
import { AuthHelper } from 'src/core/helpers/auth.helper';
import { ChatGateway } from './chat.gateway';
import { EventService } from './event.service';
import { CommunityRepository } from '../community/community.repository';
import { Paginator } from 'src/core/helpers/paginator';
import { NotificationService } from '../notification/notification.service';
import { BullModule } from '@nestjs/bullmq';

@Module({
  providers: [EventGateway, WsJwtAuthGuard, AuthHelper, ChatGateway, NotificationService, EventService, CommunityRepository, Paginator],
  imports: [
    BullModule.registerQueue({
      name: 'notification',
    })
  ]
})
export class EventModule { }
