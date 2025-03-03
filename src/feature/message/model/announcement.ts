import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Community } from "src/feature/community/model/community";
import { CommunityMember } from "src/feature/community/model/community.member";

export type AnnouncementDocument = HydratedDocument<Announcement>;

@Schema({ timestamps: true })
export class Announcement {
  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: CommunityMember.name })
  author: Types.ObjectId

  @Prop()
  title: string

  @Prop()
  body: string

  @Prop()
  platform: string
}

export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);