import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Type } from "class-transformer";
import { PropertyComplex } from "./property.complex.model";
import { HydratedDocument, Types } from "mongoose";
import { ACCESSIBILITY, AMENITIES, LEASE_PERIOD, PROPERTY_AVAILABILITY, PROPERTY_CONDITION, PROPERTY_CREATE_STAGE, PROPERTY_STATUS, PROPERTY_TYPE, UTITLITY } from "../property.constants";

export class CustomFee {
  @Prop()
  label?: string

  @Prop()
  value?: number

  @Prop({ default: true })
  oneOff: boolean
}

export class Size {
  @Prop()
  length?: number

  @Prop()
  breadth?: number
}

export type PropertyDocument = HydratedDocument<Property>;

@Schema({ timestamps: true })
export class Property {

  @Prop({ type: Types.ObjectId, ref: PropertyComplex.name })
  complex?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: PropertyComplex.name })
  account?: Types.ObjectId

  @Prop({ required: true })
  name?: string;

  @Prop({ enum: PROPERTY_STATUS, default: PROPERTY_STATUS.DRAFT })
  status?: string;

  @Prop()
  contactEmail?: string;

  @Prop()
  primaryAgent?: string;

  @Prop()
  contactPhone?: string;

  @Prop()
  description?: string;

  @Prop()
  bedrooms?: number;

  @Prop()
  bathrooms?: number;

  @Prop()
  price?: number;

  @Prop([{ type: String, enum: AMENITIES }])
  amenities?: string[]

  @Prop([{ type: String, enum: UTITLITY }])
  utilities?: string[]

  @Prop([{ type: String, enum: ACCESSIBILITY }])
  accessibilities?: string[]

  @Prop({ type: CustomFee })
  @Type(() => CustomFee)
  customFees?: CustomFee[]

  @Prop()
  pets?: boolean

  @Prop({ type: Size })
  @Type(() => Size)
  size?: Size

  @Prop()
  caution?: number

  @Prop()
  legal?: number  

  @Prop({ enum: LEASE_PERIOD })
  leasePeriod?: string

  @Prop({ enum: PROPERTY_CREATE_STAGE })
  stage?: string

  @Prop({ enum: PROPERTY_CONDITION })
  condition?: string

  @Prop([String])
  images?: string[]

  @Prop({ enum: PROPERTY_TYPE })
  type?: string

  @Prop({ enum: PROPERTY_AVAILABILITY })
  availability?: string
}

export const PropertySchema = SchemaFactory.createForClass(Property);
