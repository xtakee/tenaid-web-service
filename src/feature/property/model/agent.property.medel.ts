import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Type } from "class-transformer";
import { HydratedDocument, Types } from "mongoose";
import { AccountProperty } from "./account.property.model";
import { Apartment } from "./apartment.model";
import { PropertyApartment } from "./property.apartment";

export type AgentPropertyDocument = HydratedDocument<AgentProperty>;

@Schema()
export class AgentProperty extends Apartment {

  @Prop({ type: Types.ObjectId, required: true, ref: 'AccountProperty' })
  @Type(() => AccountProperty)
  property?: Types.ObjectId

  @Prop({ type: Types.ObjectId, required: true, ref: 'PropertyApartment' })
  @Type(() => PropertyApartment)
  apartment?: Types.ObjectId

}

export const AgentPropertySchema = SchemaFactory.createForClass(AgentProperty);