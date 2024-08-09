import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Date, HydratedDocument, Types } from "mongoose";
import { Email } from "../../core/model/email.model";
import { Address } from "../../core/model/address.model";
import { Type } from "class-transformer";
import { ACCOUNT_STATUS, ADD_ON, DEFAULT_STATUS } from "src/feature/auth/auth.constants";

export type AccountDocument = HydratedDocument<Account>;

@Schema()
export class AccountType {
  @Prop({ default: false })
  approved?: boolean

  @Prop({ enum: [...Object.values(ADD_ON)] })
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

@Schema({ timestamps: true })
export class Account {

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, enum: [...ACCOUNT_STATUS], default: DEFAULT_STATUS })
  status?: string

  @Prop({ required: true, lowercase: true, index: true, unique: true })
  email: Email;

  @Prop()
  phone?: string;

  @Prop({ type: Date })
  dob?: Date;

  @Prop()
  photo?: string

  @Prop()
  @Type(() => KYC)
  kyc?: KYC

  @Prop({ enum: [...Object.values(ADD_ON)] })
  primaryAccountType?: string

  @Prop()
  proofOfId?: string

  @Prop([AccountType])
  accountTypes?: AccountType[]

  @Prop({ type: Types.ObjectId })
  @Type(() => Address)
  address?: Address

  @Prop({ required: true })
  password: string

  @Prop()
  token?: string

}

export const AccountSchema = SchemaFactory.createForClass(Account);
