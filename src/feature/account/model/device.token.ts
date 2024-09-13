import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Account } from "./account.model";
import { DEVICE_TYPE } from "src/feature/auth/auth.constants";

export type DeviceTokenDocument = HydratedDocument<DeviceToken>;

@Schema({ timestamps: true })
export class DeviceToken {
  @Prop({ ref: Account.name })
  account: Types.ObjectId

  @Prop()
  token: string

  @Prop({ enum: DEVICE_TYPE })
  device: string
}

export const DeviceTokenSchema = SchemaFactory.createForClass(DeviceToken);