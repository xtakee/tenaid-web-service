import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Community } from "./community"
import { HydratedDocument, Types } from "mongoose"

export type CommunityCacDocument = HydratedDocument<CommunityRegistration>

@Schema({ timestamps: true })
export class CommunityRegistration {
  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId

  @Prop()
  registrationNumber: string

  @Prop()
  registrationDocument: string
}

export const CommunityRegistrationSchema = SchemaFactory.createForClass(CommunityRegistration);
