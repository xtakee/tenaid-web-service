import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { Status } from "src/core/enums/status";

export type UtilityProductDocument = HydratedDocument<UtilityProduct>

@Schema({ timestamps: true })
export class UtilityProduct {
  @Prop()
  productName?: string

  @Prop()
  productCode?: string

  @Prop()
  country?: string

  @Prop({ enum: Status, default: Status.PENDING })
  status?: string
}

export const UtilityProductSchema = SchemaFactory.createForClass(UtilityProduct);
