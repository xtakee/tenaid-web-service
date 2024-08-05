import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Date, HydratedDocument, Types } from "mongoose";
import { EmailModel } from "./email.model";
import { Address } from "./address.model";
import { Type } from "class-transformer";

export type AccountDocument = HydratedDocument<Account>;

@Schema({ timestamps: true })
export class Account {

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, lowercase: true, index: true, unique: true })
  email: EmailModel;

  @Prop([String])
  accountTypes?: string[];

  @Prop()
  phone?: string;

  @Prop({ type: Date })
  dob?: Date;

  @Prop()
  primaryAccountType?: string

  @Prop()
  photo?: string

  @Prop()
  proofOfId?: string

  @Prop({ type: Types.ObjectId, required: true })
  @Type(() => Address)
  address?: Address

  @Prop({ required: true })
  password: string

  @Prop()
  token?: string
}

export const AccountSchema = SchemaFactory.createForClass(Account);
