import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Account } from "src/feature/account/model/account.model";
import { Community } from "./community";
import { ACCOUNT_STATUS } from "src/feature/auth/auth.constants";
import { CommunityPath } from "./community.path";
import { MemberAccount } from "./member.account";

export type CommunityMemberDocument = HydratedDocument<CommunityMember>

@Schema()
export class AuthorizedAccess {
  @Prop({ type: Types.ObjectId, ref: 'CommunityMember' })
  member?: Types.ObjectId;

  @Prop()
  relationship?: string;
}

@Schema()
export class ProofOfAddress {
  @Prop()
  url?: string

  @Prop()
  name?: string

  @Prop()
  size?: number;
}

@Schema({ timestamps: true })
export class CommunityMember {
  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: Account.name })
  account?: Types.ObjectId

  @Prop({ ref: CommunityPath.name })
  path?: Types.ObjectId

  @Prop()
  description?: string

  @Prop()
  comment?: string

  @Prop({ default: 0 })
  authorizedCount?: number

  @Prop({ default: true })
  canCreateInvite?: Boolean

  @Prop({ default: true })
  canCreateExit?: Boolean

  @Prop({ default: true })
  isOwner?: Boolean

  @Prop({ type: Types.ObjectId, ref: CommunityMember.name })
  linkedTo?: Types.ObjectId

  @Prop([{ type: AuthorizedAccess }])
  authorizedAccess?: AuthorizedAccess[]

  @Prop({ type: MemberAccount })
  extra: MemberAccount

  @Prop()
  point?: string

  @Prop()
  code: string

  @Prop()
  proofOfAddress?: string

  @Prop({ index: true })
  searchable?: string

  @Prop({ default: false })
  isAdmin?: Boolean

  @Prop({ default: false })
  isPrimary?: Boolean

  @Prop({ enum: ACCOUNT_STATUS, default: ACCOUNT_STATUS.PENDING })
  status?: string
}

const CommunityMemberSchema = SchemaFactory.createForClass(CommunityMember)
CommunityMemberSchema.index({ searchable: 'text' })

export { CommunityMemberSchema }
