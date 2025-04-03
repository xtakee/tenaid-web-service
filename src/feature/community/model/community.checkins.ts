import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Community } from "./community";
import { CommunityInvite } from "./community.invite";
import { CommunityMember } from "./community.member";
import { CheckType } from "src/feature/core/dto/check.type";
import { CommunityAccessPoint } from "./community.access.point";
import { CommunityStreet } from "./community.street";
import { CommunityBuilding } from "./community.building";
import { InviteType } from "src/core/enums/invite.type";

export type CommunityCheckinsDocument = HydratedDocument<CommunityCheckins>;

@Schema({ timestamps: true })
export class CommunityCheckins {
  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: CommunityMember.name })
  member: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: CommunityStreet.name })
  street?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: CommunityBuilding.name })
  building?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: CommunityAccessPoint.name })
  accessPoint: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: CommunityInvite.name })
  invite?: Types.ObjectId

  @Prop({ enum: InviteType })
  type: string

  @Prop()
  code: string

  @Prop({ type: Date })
  date: Date

  @Prop({ enum: CheckType })
  inviteType: string

  @Prop({ index: true })
  searchable?: string
}

const CommunityCheckinsSchema = SchemaFactory.createForClass(CommunityCheckins)
CommunityCheckinsSchema.index({ searchable: 'text', code: 'text' })

export { CommunityCheckinsSchema }
