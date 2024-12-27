import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Community } from "./community";

export type CommunityMessageGroupPathDocument = HydratedDocument<CommunityMessageGroup>

@Schema({ timestamps: true })
export class CommunityMessageGroup {
  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId

  @Prop()
  name: string

  @Prop()
  description: string

  @Prop({ default: false })
  readOnly: Boolean
}

export const CommunityMessageGroupSchema = SchemaFactory.createForClass(CommunityMessageGroup)
