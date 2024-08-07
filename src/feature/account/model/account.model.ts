import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Date, HydratedDocument, Types } from "mongoose";
import { Email } from "./email.model";
import { Address } from "./address.model";
import { Type } from "class-transformer";
import { ACCOUNT_STATUS, ADD_ON_REQUEST_STATUS, DEFAULT_STATUS } from "src/constants";

export type AccountDocument = HydratedDocument<Account>;

@Schema()
export class AddOn {
  @Prop({ required: true, default: false })
  value: boolean

  @Prop({ required: true, enum: [...ADD_ON_REQUEST_STATUS], default: DEFAULT_STATUS })
  status?: string
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
  proofOfId?: string

  @Prop({ type: AddOn, default: { value: false, status: DEFAULT_STATUS } })
  @Type(() => AddOn)
  canOwn?: AddOn

  @Prop({ type: AddOn, default: { value: false, status: DEFAULT_STATUS } })
  @Type(() => AddOn)
  canPublish?: AddOn

  @Prop({ type: Types.ObjectId, required: true })
  @Type(() => Address)
  address?: Address

  @Prop({ required: true })
  password: string

  @Prop()
  token?: string
}

export const AccountSchema = SchemaFactory.createForClass(Account);
