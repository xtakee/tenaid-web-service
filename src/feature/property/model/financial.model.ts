import { Prop, Schema } from "@nestjs/mongoose";
import { Type } from "class-transformer";
import { Address } from "src/feature/core/model/address.model";
import { EMPLOYED_STATUS } from "../property.constants";

@Schema({ timestamps: true })
export class Financial {
  @Prop({ enum: EMPLOYED_STATUS })
  employmentStatus?: string

  @Prop()
  employer?: string

  @Prop()
  employerEmail?: string

  @Prop()
  employerPhone?: string

  @Prop({ type: Address })
  @Type(() => Address)
  address?: Address

  @Prop()
  income?: number
}
