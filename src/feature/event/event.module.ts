import { Module } from '@nestjs/common';
import { EventGateway } from './event.gateway';
import { WsJwtAuthGuard } from '../auth/guards/jwt.guard/ws.jwt.auth.guard';
import { AuthHelper } from 'src/core/helpers/auth.helper';

@Module({
  providers: [EventGateway, WsJwtAuthGuard, AuthHelper]
})
export class EventModule {}
