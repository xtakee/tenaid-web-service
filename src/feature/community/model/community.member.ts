import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Account } from "src/feature/account/model/account.model";
import { Community } from "./community";
import { ACCOUNT_STATUS } from "src/feature/auth/auth.constants";
import { CommunityPath } from "./community.path";

export type CommunityMemberDocument = HydratedDocument<CommunityMember>;

@Schema({ timestamps: true })
export class CommunityMember {
  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: Account.name })
  account: Types.ObjectId

  @Prop({ ref: CommunityPath.name })
  path?: Types.ObjectId

  @Prop()
  description?: string

  @Prop()
  comment?: string

  @Prop()
  point?: number

  @Prop()
  code: string

  @Prop({ default: false })
  isAdmin?: boolean

  @Prop({ enum: ACCOUNT_STATUS, default: ACCOUNT_STATUS.PENDING })
  status?: string
}

export const CommunityMemberSchema = SchemaFactory.createForClass(CommunityMember);
