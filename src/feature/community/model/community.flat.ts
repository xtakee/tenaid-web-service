import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Community } from "./community";
import { Account } from "src/feature/account/model/account";
import { CommunityBuilding } from "./community.building";
import { CommunityStreet } from "./community.street";

export type CommunityFlatDocument = HydratedDocument<CommunityFlat>;

@Schema({ timestamps: true })
export class CommunityFlat {
  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: Account.name })
  createdBy?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: CommunityStreet.name })
  street: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: CommunityBuilding.name })
  building: Types.ObjectId

  @Prop({ default: false })
  isOccupied?: Boolean

  @Prop({ default: true })
  isActive?: Boolean

  @Prop()
  name: string

  @Prop()
  code?: string

  @Prop({ type: [String], index: true })
  searchable?: string[]
}

const CommunityFlatSchema = SchemaFactory.createForClass(CommunityFlat);
CommunityFlatSchema.index({ searchable: 'text', code: 'text' })

export { CommunityFlatSchema }
