import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Community } from "./community";
import { Account } from "src/feature/account/model/account.model";

export type CommunityPathDocument = HydratedDocument<CommunityPath>;

@Schema({ timestamps: true })
export class CommunityPath {
  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: Account.name })
  account: Types.ObjectId

  @Prop()
  name: string

  @Prop()
  description: string
}

export const CommunityPathSchema = SchemaFactory.createForClass(CommunityPath);
