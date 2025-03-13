import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Type } from "class-transformer";
import { Account } from "src/feature/account/model/account.model";
import { Permission } from "../../auth/model/permission";
import { Community } from "src/feature/community/model/community";

export type ManagedAccountDocument = HydratedDocument<ManagedAccount>;

@Schema({ timestamps: true })
export class ManagedAccount {

  @Prop({ type: Types.ObjectId, required: true, ref: Community.name })
  community: Types.ObjectId

  @Prop({ type: Types.ObjectId, required: true, ref: Account.name })
  account: Types.ObjectId

  @Prop({ default: true })
  isActive?: Boolean

  @Prop({ type: Types.ObjectId, required: true, ref: Account.name })
  createdBy: Types.ObjectId

  @Prop([Permission])
  @Type(() => Permission)
  permissions: Permission[]

  @Prop()
  email?: string

  @Prop()
  name?: string

  @Prop({ index: true })
  searchable?: string
}

export const ManagedAccountSchema = SchemaFactory.createForClass(ManagedAccount);
