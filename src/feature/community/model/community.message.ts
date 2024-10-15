import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Community } from "./community";
import { CommunityMember } from "./community.member";
import { MessageType } from "src/feature/community/dto/request/message.dto";
import { Account } from "src/feature/account/model/account.model";

export type CommunityMessageDocument = HydratedDocument<CommunityMessage>;

@Schema({ timestamps: true })
export class MessageReaction {
  reaction: string
  @Prop({ type: Types.ObjectId, ref: CommunityMember.name })
  author: Types.ObjectId
}

@Schema({ timestamps: true })
export class CommunityMessage {
  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: CommunityMember.name })
  author: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: Account.name })
  account: Types.ObjectId

  @Prop({ unique: true, index: true })
  messageId: string

  @Prop({ type: [MessageReaction], default: [] })
  reactions?: MessageReaction[]

  @Prop({ type: Types.ObjectId, ref: CommunityMessage.name })
  repliedTo?: Types.ObjectId

  @Prop()
  body: string

  @Prop({ enum: MessageType })
  type: string

  @Prop()
  description?: string

  @Prop()
  name?: string

  @Prop()
  size?: number

  @Prop()
  extension?: string

  @Prop({ type: Date })
  date: Date
}

export const CommunityMessageSchema = SchemaFactory.createForClass(CommunityMessage);