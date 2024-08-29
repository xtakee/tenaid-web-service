import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Account } from "src/feature/account/model/account.model";
import { COMMUNITY_TYPE } from "../community.constants";
import { Address } from "src/feature/core/model/address.model";

export type CommunityDocument = HydratedDocument<Community>;

@Schema({ timestamps: true })
export class Community {
  @Prop({ type: Types.ObjectId, ref: Account.name })
  account: Types.ObjectId

  @Prop()
  name: string

  @Prop()
  description: string

  @Prop()
  code: string

  @Prop({ default: 0 })
  members?: number

  @Prop({ enum: COMMUNITY_TYPE })
  type: string

  @Prop()
  image?: string

  @Prop({ type: Address })
  address: Address
}

export const CommunitySchema = SchemaFactory.createForClass(Community);
