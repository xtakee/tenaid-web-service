import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Community } from "./community";
import { CommunityMember } from "./community.member";
import { INVITE_STATUS } from "../community.constants";
import { Account } from "src/feature/account/model/account";
import { InviteType } from "src/core/enums/invite.type";

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
  name: string

  @Prop()
  idempotentReference: string

  @Prop({ type: Date })
  date: Date

  @Prop({ enum: InviteType })
  type: string

  @Prop()
  photo?: string

  @Prop()
  code: string

  @Prop({ type: Boolean, default: false })
  exitOnly?: Boolean

  @Prop()
  terminalCode?: string

  @Prop({ type: Date })
  terminalDate?: Date

  @Prop({ type: Date })
  start: Date

  @Prop({ type: Date })
  end: Date

  @Prop()
  reason?: string

  @Prop({ enum: INVITE_STATUS, default: INVITE_STATUS.PENDING })
  status?: string

  @Prop()
  revokeReason?: string

  @Prop({ type: [String], index: true })
  searchable?: string[]
}

const CommunityInviteSchema = SchemaFactory.createForClass(CommunityInvite)
CommunityInviteSchema.index({ searchable: 'text', code: 'text' })

export { CommunityInviteSchema }
