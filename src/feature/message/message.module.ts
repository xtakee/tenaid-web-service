import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { AuthHelper } from 'src/core/helpers/auth.helper';
import { Paginator } from 'src/core/helpers/paginator';
import { WsJwtAuthGuard } from '../auth/guards/jwt.guard/ws.jwt.auth.guard';
import { EventService } from '../event/event.service';
import { MessageGateway } from './message.gateway';
import { NotificationModule } from '../notification/notification.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './model/message';
import { MessageCategory, MessageCategorySchema } from '../community/model/message.category';
import { MessageNode, MessageNodeSchema } from './model/message.node';
import { MessageCache, MessageCacheSchema } from './model/message.cache';
import { MessageRepository } from './message.repository';
import { CommunityModule } from '../community/community.module';
import { CacheService } from 'src/services/cache/cache.service';

@Module({
  providers: [MessageService, MessageGateway, CacheService, MessageRepository, WsJwtAuthGuard, AuthHelper, EventService, Paginator],
  controllers: [MessageController],
  imports: [NotificationModule,
    CommunityModule,
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    MongooseModule.forFeature([{ name: MessageCategory.name, schema: MessageCategorySchema }]),
    MongooseModule.forFeature([{ name: MessageNode.name, schema: MessageNodeSchema }]),
    MongooseModule.forFeature([{ name: MessageCache.name, schema: MessageCacheSchema }]),
  ],
  exports: [MessageRepository]
})

export class MessageModule { }
