import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Community } from "./community";
import { Account } from "src/feature/account/model/account";

export type CommunityPathDocument = HydratedDocument<CommunityStreet>;

@Schema({ timestamps: true })
export class CommunityStreet {
  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: Account.name })
  account: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: Account.name })
  createdBy?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: Account.name })
  updatedBy?: Types.ObjectId

  @Prop({ default: true })
  isActive?: Boolean

  @Prop()
  name: string

  @Prop()
  code: string

  @Prop({ type: [String], index: true })
  searchable?: string[]

  @Prop()
  description: string
}

const CommunityStreetSchema = SchemaFactory.createForClass(CommunityStreet);
CommunityStreetSchema.index({ searchable: 'text', code: 'text' })

export { CommunityStreetSchema }
