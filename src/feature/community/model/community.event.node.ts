import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Account } from "src/feature/account/model/account.model";
import { Community } from "./community";
import { CommunityMember } from "./community.member";

export type CommunityEventNodeDocument = HydratedDocument<CommunityEventNode>;

@Schema({ timestamps: true })
export class CommunityEventNode {
  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: Account.name })
  account: Types.ObjectId

  @Prop()
  token: string

  @Prop()
  device: string

  @Prop({ type: Types.ObjectId, ref: CommunityMember.name })
  member: Types.ObjectId

  @Prop({ enum: ['online', 'offline'], default: 'online' })
  status: string
}

export const CommunityEventNodeSchema = SchemaFactory.createForClass(CommunityEventNode);