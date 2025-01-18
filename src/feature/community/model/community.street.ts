import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Community } from "./community";
import { Account } from "src/feature/account/model/account.model";

export type CommunityPathDocument = HydratedDocument<CommunityStreet>;

@Schema({ timestamps: true })
export class CommunityStreet {
  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: Account.name })
  account: Types.ObjectId

  @Prop()
  name: string

  @Prop({ index: true })
  searchable?: string

  @Prop()
  description: string
}

const CommunityStreetSchema = SchemaFactory.createForClass(CommunityStreet);
CommunityStreetSchema.index({ searchable: 'text', code: 'text' })

export { CommunityStreetSchema }
