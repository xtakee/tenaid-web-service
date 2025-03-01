import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Community } from "src/feature/community/model/community";

export type MessageCategoryDocument = HydratedDocument<MessageCategory>

@Schema({ timestamps: true })
export class MessageCategory {
  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId

  @Prop()
  name: string

  @Prop()
  description: string

  @Prop({ default: false })
  readOnly: Boolean
}

export const MessageCategorySchema = SchemaFactory.createForClass(MessageCategory)
