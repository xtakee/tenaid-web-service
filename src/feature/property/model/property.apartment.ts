import { Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { Apartment } from "./apartment.model";

export type PropertyApartmentDocument = HydratedDocument<PropertyApartment>;

@Schema({ timestamps: true })
export class PropertyApartment extends Apartment { }

export const PropertyApartmentSchema = SchemaFactory.createForClass(PropertyApartment);
