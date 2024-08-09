import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Account } from "src/feature/account/model/account.model";
import { AccountAdmin } from "src/feature/admin/model/account.admin.model";
import { ADD_ON, ADD_ON_REQUEST_STATUS, PENDING_STATUS } from "src/feature/auth/auth.constants";

export type AddOnRequestDocument = HydratedDocument<AddOnRequest>;

@Schema({ timestamps: true })
export class AddOnRequest {
  @Prop({ type: Types.ObjectId, required: true, ref: Account.name })
  account: Types.ObjectId

  @Prop({ required: true, enum: [...Object.values(ADD_ON)] })
  addOn?: string

  @Prop({ required: true, enum: [...ADD_ON_REQUEST_STATUS], default: PENDING_STATUS })
  status?: string

  @Prop({ type: Types.ObjectId, ref: AccountAdmin.name })
  reviewer?: string
}

export const AddOnRequestSchema = SchemaFactory.createForClass(AddOnRequest);
