import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Community } from "./community"
import { HydratedDocument, Types } from "mongoose"
import { Email } from "src/feature/core/model/email.model"
import { Account } from "src/feature/account/model/account"
import { E2eeDataSchema } from "./e2ee.schema"

export type CommunityGuardDocument = HydratedDocument<CommunityGuard>

@Schema({ timestamps: true })
export class CommunityGuard {
  @Prop({ type: Types.ObjectId, ref: Community.name })
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
  secret: string

  @Prop()
  country: string

  @Prop()
  password: string

  @Prop()
  code: string

  @Prop({ type: E2eeDataSchema })
  encryptedPassword?: E2eeDataSchema

  @Prop({ default: true })
  isActive?: Boolean

  @Prop({ default: false })
  requirePasswordChange?: Boolean

  @Prop({ type: [String], index: true })
  searchable?: string[]
}

const CommunityGuardSchema = SchemaFactory.createForClass(CommunityGuard);
CommunityGuardSchema.index({ searchable: 'text', code: 'text' })

export { CommunityGuardSchema }
