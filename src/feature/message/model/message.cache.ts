import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Account } from "src/feature/account/model/account.model";
import { Community } from "src/feature/community/model/community";
import { MessageCacheType } from "../util/message.cache.type";
import { Message } from "./message";
import { MessageTarget } from "../util/message.target";

export type MessageCacheDocument = HydratedDocument<MessageCache>;

@Schema({ timestamps: true })
export class MessageCache {

  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId

  @Prop({ type: Types.ObjectId })
  room: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: Message.name })
  message: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: Account.name })
  author: Types.ObjectId

  @Prop({ default: 0 })
  reached?: number

  @Prop({ enum: MessageCacheType })
  type: string

  @Prop()
  targetNodes: number

  @Prop()
  totalNodes: number

  @Prop([{ type: MessageTarget }])
  targets?: MessageTarget[]
}

export const MessageCacheSchema = SchemaFactory.createForClass(MessageCache);
