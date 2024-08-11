import { Prop, Schema } from "@nestjs/mongoose";
import { Type } from "class-transformer";
import { Address } from "src/feature/core/model/address.model";
import { RELATIONSHIP } from "../property.constants";

@Schema()
export class Guarantor {
  @Prop()
  name?: string

  @Prop({ type: Address })
  @Type(() => Address)
  address?: Address

  @Prop()
  phone?: string

  @Prop({ enum: RELATIONSHIP })
  relationship?: string
}