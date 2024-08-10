import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Type } from "class-transformer";
import { HydratedDocument, Types } from "mongoose";
import { Account } from "src/feature/account/model/account.model";
import { Address } from "src/feature/core/model/address.model";
import { PropertyApartment } from "./property.apartment";

export type AccountPropertyDocument = HydratedDocument<AccountProperty>;

@Schema({ timestamps: true })
export class AccountProperty {
  @Prop({ type: Types.ObjectId, required: true, ref: Account.name })
  @Type(() => Address)
  account?: Types.ObjectId

  @Prop()
  contactEmail?: string;

  @Prop()
  contactPhone?: string;

  @Prop()
  floors?: number;

  @Prop()
  allowPets?: boolean;

  @Prop({ type: Boolean, default: false })
  isMultiple?: boolean

  @Prop({ type: [{ type: Types.ObjectId, ref: PropertyApartment.name }] })
  @Type(() => PropertyApartment)
  apartments?: Types.ObjectId[]

  @Prop({ type: Types.ObjectId, required: true })
  @Type(() => Address)
  address?: Address
}

export const AccountPropertySchema = SchemaFactory.createForClass(AccountProperty);
