import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument, Types } from "mongoose"
import { Community } from "./community"
export type CommunitySummaryDocument = HydratedDocument<CommunitySummary>

@Schema({ timestamps: true })
export class CommunitySummary {

  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId

  @Prop({ default: 0 })
  streets?: number

  @Prop({ default: 0 })
  buildings?: number

  @Prop({ default: 0 })
  members?: number

  @Prop({ default: 0 })
  visitors?: number
}

export const CommunitySummarySchema = SchemaFactory.createForClass(CommunitySummary)
