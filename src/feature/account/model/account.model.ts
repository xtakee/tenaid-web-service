import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Email } from "../../core/model/email.model";
import { Address } from "../../core/model/address.model";
import { Type } from "class-transformer";
import { ACCOUNT_STATUS, ADD_ON, GENDER } from "src/feature/auth/auth.constants";
import { IDENTITY_TYPE } from "src/core/enums/identity.type";

export type AccountDocument = HydratedDocument<Account>;

@Schema()
export class AccountType {
  @Prop({ default: false })
  approved?: Boolean

  @Prop({ enum: ADD_ON })
  type?: string
}

@Schema()
export class KYC {
  @Prop({ required: true, default: false })
  profileCompleted?: boolean

  @Prop({ required: true, default: false })
  addressCompleted?: boolean

  @Prop({ required: true, default: false })
  bankingCompleted?: boolean
}

@Schema()
export class DashboardFlags {
  @Prop({ default: true })
  welcome?: Boolean

  @Prop({ default: false })
  quickActions?: Boolean

  @Prop({ default: true })
  joinCommunity?: Boolean

  @Prop({ default: true })
  createCommunity?: Boolean
}

@Schema()
export class PermissionFlags {
  @Prop({ default: true })
  canCreateCommunity?: Boolean

  @Prop({ default: true })
  canJoinCommunity?: Boolean
}

@Schema({ timestamps: true })
export class Account {

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, enum: ACCOUNT_STATUS, default: ACCOUNT_STATUS.DEFAULT })
  status?: string

  @Prop({ required: true, lowercase: true, index: true, unique: true })
  email: Email;

  @Prop()
  phone?: string;

  @Prop()
  country?: string

  @Prop({ default: true })
  hasPassword?: Boolean

  @Prop({ type: DashboardFlags, default: new DashboardFlags() })
  flags?: DashboardFlags

  @Prop({ type: PermissionFlags, default: new PermissionFlags() })
  permissions?: PermissionFlags

  @Prop({ type: Date })
  dob?: Date;

  @Prop()
  photo?: string

  @Prop({ index: true })
  searchable?: string

  @Prop({ type: Boolean, default: false })
  hasCommunity?: Boolean

  @Prop({ enum: GENDER })
  gender?: string

  @Prop()
  @Type(() => KYC)
  kyc?: KYC

  @Prop({ enum: ADD_ON })
  primaryAccountType?: string

  @Prop([AccountType])
  accountTypes?: AccountType[]

  @Prop({ type: Types.ObjectId })
  @Type(() => Address)
  address?: Address

  @Prop({ required: true })
  password: string

  @Prop()
  token?: string

  @Prop()
  idNumber?: string

  @Prop({ enum: IDENTITY_TYPE })
  identityType?: string

  @Prop()
  identity?: string
}

const AccountSchema = SchemaFactory.createForClass(Account)
AccountSchema.index({ searchable: 'text' })

export { AccountSchema }
