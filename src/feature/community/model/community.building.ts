import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Community } from "./community"
import { HydratedDocument, Types } from "mongoose"
import { Email } from "src/feature/core/model/email.model"
import { BUILDING_TYPE } from "src/core/enums/building.type"
import { CommunityStreet } from "./community.street"

export type CommunityBuildingDocument = HydratedDocument<CommunityBuilding>

@Schema({ timestamps: true })
export class CommunityBuilding {
  @Prop([{ type: Types.ObjectId, ref: Community.name }])
  community: Types.ObjectId

  @Prop([{ type: Types.ObjectId, ref: CommunityStreet.name }])
  street: Types.ObjectId

  @Prop()
  contactEmail: Email

  @Prop()
  contactPhone: string

  @Prop()
  contactPerson: string

  @Prop({ default: 0 })
  apartments: number

  @Prop()
  buildingNumber: string

  @Prop({ enum: BUILDING_TYPE })
  type?: string

  @Prop({ index: true })
  searchable?: string
}

const CommunityBuildingSchema = SchemaFactory.createForClass(CommunityBuilding);
CommunityBuildingSchema.index({ searchable: 'text', code: 'text' })

export { CommunityBuildingSchema }
