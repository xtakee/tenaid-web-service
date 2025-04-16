import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument, Types } from "mongoose"
import { Community } from "./community"
import { Account } from "src/feature/account/model/account"
import { CommunityStreet } from "./community.street"

export type CommunityFlatDocument = HydratedDocument<CommunityDraft>

enum DraftType {
  BUILDING = 'building',
  RESIDENT = 'resident'
}

@Schema({ timestamps: true })
export class CommunityDraft {
  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: CommunityStreet.name })
  street: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: Account.name })
  createdBy: Types.ObjectId

  @Prop({ type: {} })
  data: {}

  @Prop({ enum: DraftType })
  type: string


  @Prop({ type: [String], index: true })
  searchable?: string[]
}

const CommunityDraftSchema = SchemaFactory.createForClass(CommunityDraft)
CommunityDraftSchema.index({ searchable: 'text', code: 'text' })

export { CommunityDraftSchema }
