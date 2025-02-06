import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Community } from "src/feature/community/model/community";
import { CommunityMember } from "src/feature/community/model/community.member";
import { Billable } from "./billable";
import { BillStatus } from "src/core/enums/bill.status";

export type BillingDocument = HydratedDocument<Billing>;

@Schema({ timestamps: true })
export class Billing {

  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: CommunityMember.name })
  member: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: Billable.name })
  billable: Types.ObjectId

  @Prop({ default: 0 })
  amountPaid: number

  @Prop({ enum: BillStatus, default: BillStatus.PENDING })
  status: string

  @Prop()
  searchable?: string
}

const BillingSchema = SchemaFactory.createForClass(Billing)
BillingSchema.index({ searchable: 'text' })

export { BillingSchema }
