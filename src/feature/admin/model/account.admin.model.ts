import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Type } from "class-transformer";
import { HydratedDocument, Types } from "mongoose";
import { Email } from "src/feature/core/model/email.model";

export type AccountAdminDocument = HydratedDocument<AccountAdmin>;

@Schema({ timestamps: true })
export class AccountAdmin {
  @Prop()
  firstName: string

  @Prop()
  lastName: string

  @Prop()
  @Type(() => Email)
  email: Email

  @Prop()
  phone: string

  @Prop()
  password: string
}

export const AccountAdminSchema = SchemaFactory.createForClass(AccountAdmin);
