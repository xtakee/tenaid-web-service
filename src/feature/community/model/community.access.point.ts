import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Community } from "./community";
import { Account } from "src/feature/account/model/account.model";

export type CommunityAccessPointDocument = HydratedDocument<CommunityAccessPoint>;

@Schema({ timestamps: true })
export class CommunityAccessPoint {
  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: Account.name })
  account: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: Account.name })
  createdBy: Types.ObjectId

  @Prop()
  password?: string

  @Prop()
  code?: string

  @Prop({ index: true })
  name: string

  @Prop({ default: true })
  isActive?: Boolean

  @Prop()
  description: string
}

export const CommunityAccessPointSchema = SchemaFactory.createForClass(CommunityAccessPoint);
