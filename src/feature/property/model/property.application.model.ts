import { Prop, Schema } from "@nestjs/mongoose";
import { Type } from "class-transformer";
import { Types } from "mongoose";
import { Account } from "src/feature/account/model/account.model";
import { Financial } from "src/feature/property/model/financial.model";
import { PropertyApartment } from "./property.apartment";
import { APPLICATION_STATUS } from "../property.constants";

@Schema({ timestamps: true })
export class PropertyApplication {

  @Prop({ type: Types.ObjectId, ref: PropertyApartment.name })
  apartment?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: Account.name })
  account?: Types.ObjectId

  @Prop({ type: Financial })
  @Type(() => Financial)
  financials?: Financial

  @Prop()
  attachments?: string[]

  @Prop()
  reason?: string

  @Prop()
  landlordName?: string

  @Prop()
  landlordEmail?: string

  @Prop()
  landlordPhone?: string

  @Prop()
  occupants?: number

  @Prop({ default: false })
  pets?: boolean

  @Prop({ enum: APPLICATION_STATUS, default: 'editing' })
  status?: string
}
