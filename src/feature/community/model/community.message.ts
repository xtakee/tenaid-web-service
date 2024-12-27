import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Community } from "./community";
import { CommunityMember } from "./community.member";
import { Account } from "src/feature/account/model/account.model";
import { CommunityMessageGroup } from "./community.message.group";

export type CommunityMessageDocument = HydratedDocument<CommunityMessage>;

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  VIDEO = 'video'
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered'
}

@Schema({ timestamps: true })
export class MessageReaction {
  @Prop()
  reaction: string

  @Prop({ default: 0 })
  count: number

  @Prop([{ type: Types.ObjectId, ref: CommunityMember.name }])
  users: Types.ObjectId[]
}

@Schema({ timestamps: true })
export class CommunityMessage {
  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: CommunityMember.name })
  author: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: CommunityMessageGroup.name })
  category?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: Account.name })
  account: Types.ObjectId

  @Prop({ unique: true, index: true })
  messageId: string

  @Prop([{ type: MessageReaction }])
  reactions?: MessageReaction[]

  @Prop({ type: Types.ObjectId, ref: CommunityMessage.name })
  repliedTo?: Types.ObjectId

  @Prop()
  body: string

  @Prop()
  path?: string

  @Prop({ enum: MessageType })
  type: string

  @Prop({ enum: MessageStatus, default: MessageStatus.SENT })
  status?: string

  @Prop()
  description?: string

  @Prop()
  name?: string

  @Prop({ default: false })
  edited?: Boolean

  @Prop({ default: false })
  retained?: Boolean

  @Prop({ default: false })
  deleted?: Boolean

  @Prop()
  size?: number

  @Prop()
  extension?: string

  @Prop({ type: Date })
  date: Date
}

export const CommunityMessageSchema = SchemaFactory.createForClass(CommunityMessage);