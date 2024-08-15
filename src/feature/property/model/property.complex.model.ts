import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Type } from "class-transformer";
import { HydratedDocument, Types } from "mongoose";
import { Account } from "src/feature/account/model/account.model";
import { Address } from "src/feature/core/model/address.model";

export type AccountPropertyDocument = HydratedDocument<PropertyComplex>;

@Schema({ timestamps: true })
export class PropertyComplex {
  @Prop({ type: Types.ObjectId, required: true, ref: Account.name })
  @Type(() => Address)
  account?: Types.ObjectId

  @Prop({ required: true })
  name?: string;

  @Prop()
  media?: string[];

  @Prop({ required: true })
  description?: string;

  @Prop()
  allowPets?: boolean;

  @Prop({ type: Types.ObjectId, required: true })
  @Type(() => Address)
  address?: Address
}

export const PropertyComplexSchema = SchemaFactory.createForClass(PropertyComplex);
