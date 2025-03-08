import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument, Types } from "mongoose"
import { Account } from "src/feature/account/model/account.model"
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

  @Prop()
  coverPhoto?: string

  @Prop({ default: false })
  isActive: Boolean

  @Prop()
  startAt: Date

  @Prop()
  endAt: Date
}

export const CommunityAnnouncementSchema = SchemaFactory.createForClass(CommunityAnnouncement);