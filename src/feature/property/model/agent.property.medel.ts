import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Type } from "class-transformer";
import { HydratedDocument, Types } from "mongoose";
import { Property } from "./property.model";
import { PropertyComplex } from "./property.complex.model";

export type AgentPropertyDocument = HydratedDocument<AgentProperty>;

@Schema()
export class AgentProperty extends Property {

  @Prop({ type: Types.ObjectId, required: true, ref: 'AccountProperty' })
  @Type(() => Property)
  property?: Types.ObjectId

  @Prop({ type: Types.ObjectId, required: true, ref: 'PropertyApartment' })
  @Type(() => PropertyComplex)
  complex?: Types.ObjectId
}

export const AgentPropertySchema = SchemaFactory.createForClass(AgentProperty);