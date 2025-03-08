import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument, Types } from "mongoose"
import { Community } from "./community"
import { CommunityStreet } from "./community.street"
export type StreetSummaryDocument = HydratedDocument<StreetSummary>

@Schema({ timestamps: true })
export class StreetSummary {

  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: CommunityStreet.name })
  street: Types.ObjectId

  @Prop({ default: 0 })
  buildings?: number

  @Prop({ default: 0 })
  members?: number

  @Prop({ default: 0 })
  visitors?: number
}

export const StreetSummarySchema = SchemaFactory.createForClass(StreetSummary)
