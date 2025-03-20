import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument, Types } from "mongoose"
import { Frequency } from "src/core/enums/frequency";
import { Account } from "src/feature/account/model/account"
import { Community } from "src/feature/community/model/community"

export type CommunityAnnouncementDocument = HydratedDocument<CommunityAnnouncement>;

@Schema({ timestamps: true })
export class CommunityAnnouncement {
  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: Account.name })
  createdBy: Types.ObjectId

  @Prop()
  title: string

  @Prop()
  body: string

  @Prop({ enum: Frequency })
  frequency?: string

  @Prop({ default: false })
  isRecurring: Boolean

  @Prop()
  images?: string[]

  @Prop({ default: false })
  isActive: Boolean

  @Prop()
  startDate: Date

  @Prop()
  endDate?: Date

  @Prop({ type: [String], index: true })
  searchable?: string[]
}

const CommunityAnnouncementSchema = SchemaFactory.createForClass(CommunityAnnouncement);
CommunityAnnouncementSchema.index({ searchable: 'text', code: 'text' })

export { CommunityAnnouncementSchema }
