import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Type } from "class-transformer";
import { Account } from "src/feature/account/model/account.model";
import { Permission } from "./permission";
import { ACCOUNT_PERMISSION_STATUS, DEFAULT_STATUS } from "../auth.constants";

export type ManagedAccountDocument = HydratedDocument<ManagedAccount>;

@Schema({ timestamps: true })
export class ManagedAccount {

  @Prop({ type: Types.ObjectId, required: true, ref: Account.name })
  account: Types.ObjectId

  @Prop({ type: Types.ObjectId, required: true, ref: Account.name })
  owner: Types.ObjectId

  @Prop([Permission])
  @Type(() => Permission)
  permissions?: Permission[]

  @Prop({ required: true, enum: [...ACCOUNT_PERMISSION_STATUS], default: DEFAULT_STATUS })
  status?: string
}

export const ManagedAccountSchema = SchemaFactory.createForClass(ManagedAccount);