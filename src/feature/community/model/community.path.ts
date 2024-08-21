import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Community } from "./community";

export type CommunityPathDocument = HydratedDocument<CommunityPath>;

@Schema({timestamps: true})
export class CommunityPath {
  @Prop({type: Types.ObjectId, ref: Community.name})
  community: Types.ObjectId

  @Prop()
  name: string
}

export const CommunityPathSchema = SchemaFactory.createForClass(CommunityPath);
