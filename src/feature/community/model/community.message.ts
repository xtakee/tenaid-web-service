import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Community } from "./community";


export type CommunityMessageDocument = HydratedDocument<CommunityMessage>;

@Schema({ timestamps: true })
export class CommunityMessage {
  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId

  @Prop({ type: Types.Map<string> })
  message: Types.Map<string>

  @Prop({ type: Date })
  date: Date
}

export const CommunityMessageSchema = SchemaFactory.createForClass(CommunityMessage);