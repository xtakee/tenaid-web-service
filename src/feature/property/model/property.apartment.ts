import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Apartment } from "./apartment.model";
import { AccountProperty } from "./account.property.model";

export type PropertyApartmentDocument = HydratedDocument<PropertyApartment>;

@Schema({ timestamps: true })
export class PropertyApartment extends Apartment {
  @Prop({ type: Types.ObjectId, ref: AccountProperty.name })
  property?: Types.ObjectId
}

export const PropertyApartmentSchema = SchemaFactory.createForClass(PropertyApartment);
