import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Community } from "./community"
import { HydratedDocument, Types } from "mongoose"
import { Email } from "src/feature/core/model/email.model"
import { Account } from "src/feature/account/model/account.model"

export type CommunityContactDocument = HydratedDocument<CommunityContact>

@Schema({ timestamps: true })
export class CommunityContact {
  @Prop([{ type: Types.ObjectId, ref: Community.name }])
  community: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: Account.name })
  createdBy: Types.ObjectId

  @Prop()
  fullName?: string

  @Prop()
  email: Email

  @Prop()
  phone: string

  @Prop()
  country: string

  @Prop()
  tag: string

  @Prop({ default: true })
  isActive?: Boolean

  @Prop({ index: true })
  searchable?: string
}

const CommunityContactSchema = SchemaFactory.createForClass(CommunityContact);
CommunityContactSchema.index({ searchable: 'text', code: 'text' })

export { CommunityContactSchema }
