import { Module } from '@nestjs/common';
import { WsJwtAuthGuard } from '../auth/guards/jwt.guard/ws.jwt.auth.guard';
import { AuthHelper } from 'src/core/helpers/auth.helper';
import { MessageRelayGateway } from './message.relay.gateway';
import { EventService } from './event.service';
import { CommunityRepository } from '../community/community.repository';
import { Paginator } from 'src/core/helpers/paginator';
import { NotificationService } from '../notification/notification.service';
import { BullModule } from '@nestjs/bullmq';

@Module({
  providers: [MessageRelayGateway, WsJwtAuthGuard, AuthHelper, NotificationService, EventService, CommunityRepository, Paginator],
  imports: [
    BullModule.registerQueue({
      name: 'notification',
    })
  ]
})
export class EventModule { }
