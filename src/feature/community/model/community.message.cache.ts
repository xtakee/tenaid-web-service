import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument, Types } from "mongoose"
import { Community } from "./community"
import { CommunityMessage } from "./community.message";
import { Account } from "src/feature/account/model/account.model";
import { Platform } from "src/core/util/platform";

export type CommunityMessageCacheDocument = HydratedDocument<CommunityMessageCache>;

export enum EventCacheType {
  NEW_MESSAGE = 'community-message',
  UPDATE_MESSAGE = 'community-message-update',
  DELETE_MESSAGE = 'community-message-delete',
  REACT_MESSAGE = 'community-message-reaction'
}

class MessageTarget {
  @Prop({ type: Types.ObjectId, ref: Account.name })
  target?: Types.ObjectId

  @Prop({ enum: Platform })
  platform: string
}

@Schema({ timestamps: true })
export class CommunityMessageCache {

  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: CommunityMessage.name })
  message: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: Account.name })
  author: Types.ObjectId

  @Prop({ default: 0 })
  reached?: number

  @Prop({ enum: EventCacheType })
  type: string

  @Prop()
  targetNodes: number

  @Prop()
  totalNodes: number

  @Prop([{ type: MessageTarget }])
  targets?: MessageTarget[]
}

export const CommunityMessageCacheSchema = SchemaFactory.createForClass(CommunityMessageCache);
