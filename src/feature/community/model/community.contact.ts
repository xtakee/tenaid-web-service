import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Community } from "./community"
import { HydratedDocument, Types } from "mongoose"
import { Email } from "src/feature/core/model/email.model"

export type CommunityContactDocument = HydratedDocument<CommunityContact>

@Schema({ timestamps: true })
export class CommunityContact {
  @Prop([{ type: Types.ObjectId, ref: Community.name }])
  community: Types.ObjectId

  @Prop()
  firstName?: string

  @Prop()
  lastName?: string

  @Prop()
  email: Email

  @Prop()
  phone: string

  @Prop({ index: true })
  searchable?: string
}

const CommunityContactSchema = SchemaFactory.createForClass(CommunityContact);
CommunityContactSchema.index({ searchable: 'text', code: 'text' })

export { CommunityContactSchema }
