import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument, Types } from "mongoose"
import { Account } from "src/feature/account/model/account"
import { Community } from "src/feature/community/model/community"
import { CommunityMember } from "src/feature/community/model/community.member"
import { MessageStatus } from "../util/message.status"
import { MessageType } from "../util/message.type"
import { MessageReaction } from "./message.reaction"
import { MessageCategory } from "../../community/model/message.category"
import { MessageVisibility } from "../util/message.visibility"
import { E2eeDataSchema } from "src/feature/community/model/e2ee.schema"

export type MessageDocument = HydratedDocument<Message>

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId

  @Prop({ type: Types.ObjectId })
  room?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: CommunityMember.name })
  author: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: MessageCategory.name })
  category?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: Account.name })
  account: Types.ObjectId

  @Prop({ enum: MessageVisibility })
  visibility: string

  @Prop({ unique: true, index: true })
  messageId: string

  @Prop([{ type: MessageReaction }])
  reactions?: MessageReaction[]

  @Prop({ type: Types.ObjectId, ref: Message.name })
  repliedTo?: Types.ObjectId

  @Prop()
  body: string

  @Prop({ type: [String] })
  media?: string[]

  @Prop()
  path?: string

  @Prop()
  thumbnail?: string

  @Prop({ type: E2eeDataSchema })
  encryption?: E2eeDataSchema

  @Prop({ enum: MessageType })
  type: string

  @Prop({ enum: MessageStatus, default: MessageStatus.SENT })
  status?: string

  @Prop({ default: false })
  edited?: Boolean

  @Prop({ default: true })
  retained?: Boolean

  @Prop({ default: false })
  deleted?: Boolean

  @Prop({ type: Types.ObjectId, ref: CommunityMember.name })
  deletedBy?: Types.ObjectId

  @Prop()
  size?: number

  @Prop()
  height?: number

  @Prop()
  width?: number

  @Prop()
  extension?: string

  @Prop({ type: Date })
  date: Date

  @Prop()
  platform: string
}

export const MessageSchema = SchemaFactory.createForClass(Message)