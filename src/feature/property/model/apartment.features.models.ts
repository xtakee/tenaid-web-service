import { Prop, Schema } from "@nestjs/mongoose";

const ACC_FEATURES = ['Wheel Chair', 'Parking Space', 'Elavator']

@Schema({ timestamps: true })
export class ApartmentFeatures {

  @Prop({ enum: ACC_FEATURES })
  accessibility?: string[]

  @Prop([String])
  amenities?: string[]

  @Prop({ enum: ['furnished', 'semi-furnished', 'unfurnished'] })
  furnishing?: string
}
