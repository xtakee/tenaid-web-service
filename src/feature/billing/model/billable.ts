import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { BillClass } from "src/core/enums/bill.class";
import { BillFrequency } from "src/core/enums/bill.frequency";
import { BillType } from "src/core/enums/bill.type";
import { Community } from "src/feature/community/model/community";

export type BillableDocument = HydratedDocument<Billable>;

@Schema({ timestamps: true })
export class Billable {

  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId
  
  @Prop()
  name: string

  @Prop()
  description: string

  @Prop()
  country: string

  @Prop({ default: 0 })
  amount: number

  @Prop({ enum: BillType })
  type: string

  @Prop({ type: Date })
  startDate: Date

  @Prop({ enum: BillClass })
  billClass: string

  @Prop({ enum: BillFrequency })
  frequency: string

  @Prop()
  searchable?: string
}

const BillableSchema = SchemaFactory.createForClass(Billable)
BillableSchema.index({ searchable: 'text' })

export { BillableSchema }
