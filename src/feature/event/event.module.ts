import { Module } from '@nestjs/common';
import { EventGateway } from './event.gateway';
import { WsJwtAuthGuard } from '../auth/guards/jwt.guard/ws.jwt.auth.guard';
import { AuthHelper } from 'src/core/helpers/auth.helper';
import { ChatGateway } from './chat.gateway';
import { EventService } from './event.service';
import { CommunityRepository } from '../community/community.repository';
import { Paginator } from 'src/core/helpers/paginator';

@Module({
  providers: [EventGateway, WsJwtAuthGuard, AuthHelper, ChatGateway, EventService, CommunityRepository, Paginator],
  imports: [
    
  ]
})
export class EventModule {}
