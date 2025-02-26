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
import { MessageCategory, MessageCategorySchema } from './model/message.category';
import { MessageNode, MessageNodeSchema } from './model/message.node';
import { MessageCache, MessageCacheSchema } from './model/message.cache';

@Module({
  providers: [MessageService, MessageGateway, WsJwtAuthGuard, AuthHelper, EventService, Paginator],
  controllers: [MessageController],
  imports: [NotificationModule, 
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    MongooseModule.forFeature([{ name: MessageCategory.name, schema: MessageCategorySchema }]),
    MongooseModule.forFeature([{ name: MessageNode.name, schema: MessageNodeSchema }]),
    MongooseModule.forFeature([{ name: MessageCache.name, schema: MessageCacheSchema }]),
  ]
})

export class MessageModule { }
