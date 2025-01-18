import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Community } from "./community"
import { HydratedDocument, Types } from "mongoose"
import { Email } from "src/feature/core/model/email.model"
import { IDENTITY_TYPE } from "src/core/enums/identity.type"

export type CommunityDirectorDocument = HydratedDocument<CommunityDirector>

@Schema({ timestamps: true })
export class CommunityDirector {
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

  @Prop()
  country: string

  @Prop()
  idNumber: string

  @Prop({ enum: IDENTITY_TYPE })
  identityType?: string

  @Prop()
  identity?: string

  @Prop({ index: true })
  searchable?: string
}

const CommunityDirectorSchema = SchemaFactory.createForClass(CommunityDirector);
CommunityDirectorSchema.index({ searchable: 'text', code: 'text' })

export { CommunityDirectorSchema }
