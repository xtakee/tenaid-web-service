import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Community } from "./community";
import { CommunityMember } from "./community.member";
import { INVITE_STATUS } from "../community.constants";
import { Account } from "src/feature/account/model/account.model";

export type CommunityInviteDocument = HydratedDocument<CommunityInvite>;

@Schema({ timestamps: true })
export class CommunityInvite {
  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: CommunityMember.name })
  member: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: Account.name })
  account: Types.ObjectId

  @Prop()
  name?: string

  @Prop()
  photo?: string

  @Prop()
  code?: string

  @Prop()
  expected?: string

  @Prop()
  checkIn?: string

  @Prop()
  checkOut?: string

  @Prop({ enum: INVITE_STATUS, default: INVITE_STATUS.PENDING })
  status?: string

  @Prop()
  summary?: string
}

export const CommunityInviteSchema = SchemaFactory.createForClass(CommunityInvite);
