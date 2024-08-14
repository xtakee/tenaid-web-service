import { Prop, Schema } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Address {
  @Prop()
  address: string;

  @Prop()
  city: string;

  @Prop()
  postalCode: string;

  @Prop()
  country: string;

  @Prop()
  proofOfAddress: string;

  @Prop()
  latitude?: string;

  @Prop()
  longitude?: string;
}
