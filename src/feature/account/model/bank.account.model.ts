import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Type } from "class-transformer";
import { Bank } from "src/feature/bank/model/bank.model";

export type BankAccountDocument = HydratedDocument<BankAccount>;

@Schema({ timestamps: true })
export class BankAccount {

  @Prop({ required: true })
  number: string;

  @Prop({ required: true, default: false })
  isPrimary?: boolean;

  @Prop({ type: Types.ObjectId, required: true })
  @Type(() => Bank)
  bank: Bank;

  @Prop({ type: Types.ObjectId, ref: 'Account', required: true })
  account: Types.ObjectId;
}

export const BankAccountSchema = SchemaFactory.createForClass(BankAccount);