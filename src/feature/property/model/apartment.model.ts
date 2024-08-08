import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Type } from "class-transformer";

@Schema()
export class CustomPayment {
  @Prop()
  label?: string

  @Prop()
  value?: number
}

@Schema({ timestamps: true })
export class Apartment {

  @Prop({ required: true })
  name?: string;

  @Prop()
  description?: string;

  @Prop()
  bedrooms?: number;

  @Prop()
  bathrooms?: number;

  @Prop()
  price?: number;

  @Prop([String])
  amenities?: string[]

  @Prop([CustomPayment])
  @Type(() => CustomPayment)
  customPayments?: CustomPayment[]

  @Prop()
  pets?: boolean

  @Prop()
  cautionFeePercent?: number

  @Prop({ enum: ['monthly', 'yearly'] })
  leasePeriod?: string

  @Prop({ enum: ['furnished', 'semi-furnished', 'unfurnished'] })
  furnishing?: string

  @Prop([String])
  images?: string[]
}
