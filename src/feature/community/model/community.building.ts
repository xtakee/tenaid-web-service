import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Community } from "./community"
import { HydratedDocument, Types } from "mongoose"
import { Email } from "src/feature/core/model/email.model"
import { CommunityPath } from "./community.path"
import { BUILDING_TYPE } from "src/core/enums/building.type"

export type CommunityBuildingDocument = HydratedDocument<CommunityBuilding>

@Schema({ timestamps: true })
export class CommunityBuilding {
  @Prop([{ type: Types.ObjectId, ref: Community.name }])
  community: Types.ObjectId

  @Prop([{ type: Types.ObjectId, ref: CommunityPath.name }])
  path: Types.ObjectId

  @Prop()
  contactEmail: Email

  @Prop()
  contactPhone: string

  @Prop()
  contactPerson: string

  @Prop()
  buildingNumber: string

  @Prop({ enum: BUILDING_TYPE })
  type?: string
}

export const CommunityBuildingSchema = SchemaFactory.createForClass(CommunityBuilding)
