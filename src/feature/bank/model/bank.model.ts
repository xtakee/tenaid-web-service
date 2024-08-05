import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type BankDocument = HydratedDocument<Bank>;

@Schema({ timestamps: true })
export class Bank {

  @Prop()
  name: string;

  @Prop()
  slug: string;

  @Prop()
  code: string;

  @Prop()
  longCode: string;

  @Prop()
  type: string;

  @Prop()
  country: string;

  @Prop()
  currency: string;
}

export const BankSchema = SchemaFactory.createForClass(Bank);
