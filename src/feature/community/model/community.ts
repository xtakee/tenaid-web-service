import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Account } from "src/feature/account/model/account.model";
import { COMMUNITY_TYPE } from "../community.constants";
import { Address } from "src/feature/core/model/address.model";
import { ACCOUNT_STATUS } from "src/feature/auth/auth.constants";

export type CommunityDocument = HydratedDocument<Community>;

@Schema({ timestamps: true })
export class Community {
  @Prop({ type: Types.ObjectId, ref: Account.name })
  account: Types.ObjectId

  @Prop({ index: true })
  name: string

  @Prop()
  description: string

  @Prop({ unique: true, index: true })
  code: string

  @Prop({ default: 0 })
  members?: number

  @Prop({ enum: COMMUNITY_TYPE })
  type: string

  @Prop()
  images?: string[]

  @Prop({enum: ACCOUNT_STATUS, default: ACCOUNT_STATUS.PENDING})
  status?: string

  @Prop({ type: Address })
  address: Address
}

const CommunitySchema = SchemaFactory.createForClass(Community);
CommunitySchema.index({ name: 'text', code: 'text' })

export { CommunitySchema }
