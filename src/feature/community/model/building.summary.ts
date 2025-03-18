import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument, Types } from "mongoose"
import { Community } from "./community"
import { CommunityBuilding } from "./community.building"
export type BuildingSummaryDocument = HydratedDocument<BuildingSummary>

@Schema({ timestamps: true })
export class BuildingSummary {

  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: CommunityBuilding.name })
  building: Types.ObjectId

  @Prop({ default: 0 })
  members?: number

  @Prop({ default: 0 })
  visitors?: number
}

export const BuildingSummarySchema = SchemaFactory.createForClass(BuildingSummary)
