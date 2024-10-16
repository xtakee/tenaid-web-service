import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Account } from "src/feature/account/model/account.model";
import { Community } from "./community";

export type CommunityEventBufferDocument = HydratedDocument<CommunityEventBuffer>;

export enum EventBufferType {
  UPDATE_MESSAGE = 'update_message',
  DELETE_MESSAGE = 'delete_message'
}

@Schema({ timestamps: true })
export class CommunityEventBuffer {

  @Prop({ type: Types.ObjectId, ref: Community.name })
  community: Types.ObjectId

  @Prop({ type: Object })
  event: Object

  @Prop({default: 0})
  targetReached?: number

  @Prop({ enum: EventBufferType })
  type: string

  @Prop()
  totalTarget: number

  @Prop({ type: [Types.ObjectId], default: [] })
  targets?: Types.ObjectId[]
}

export const CommunityEventBufferSchema = SchemaFactory.createForClass(CommunityEventBuffer);