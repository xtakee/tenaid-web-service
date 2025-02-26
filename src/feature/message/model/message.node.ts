import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Account } from "src/feature/account/model/account.model";
import { Community } from "src/feature/community/model/community";

export type MessageNodeDocument = HydratedDocument<MessageNode>;

@Schema({ timestamps: true })
export class MessageNode {
  @Prop([{ type: Types.ObjectId, ref: Community.name }])
  rooms: Types.ObjectId[]

  @Prop({ type: Types.ObjectId, ref: Account.name })
  account: Types.ObjectId

  @Prop()
  token?: string

  @Prop({ default: true })
  appOpenedSinceLastPush?: Boolean

  @Prop()
  device: string

  @Prop()
  platform: string

  @Prop({ enum: ['online', 'offline'], default: 'online' })
  status: string
}

export const MessageNodeSchema = SchemaFactory.createForClass(MessageNode);