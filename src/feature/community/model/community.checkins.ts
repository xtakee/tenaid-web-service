import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Community } from "./community";
import { CommunityInvite } from "./community.invite";
import { CommunityMember } from "./community.member";
import { CheckType } from "src/feature/core/dto/check.type";

export type CommunityCheckinsDocument = HydratedDocument<CommunityInvite>;

@Schema({ timestamps: true })
export class CommunityCheckins {
  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: CommunityMember.name })
  member: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: CommunityInvite.name })
  invite?: Types.ObjectId

  @Prop()
  code: string

  @Prop({ type: Date })
  date: Date

  @Prop({ enum: CheckType })
  type: string
}

export const CommunityCheckinsSchema = SchemaFactory.createForClass(CommunityCheckins);
