import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Type } from "class-transformer";
import { HydratedDocument } from "mongoose";
import { Permission } from "src/feature/auth/model/permission";
import { Email } from "src/feature/core/model/email.model";

export type AccountAdminDocument = HydratedDocument<AccountAdmin>;

@Schema({ timestamps: true })
export class AccountAdmin {
  @Prop()
  firstName: string

  @Prop()
  lastName: string

  @Prop({ required: true })
  @Type(() => Email)
  email: Email

  @Prop()
  phone: string

  @Prop()
  photo?: string

  @Prop({ required: true })
  password: string

  @Prop([Permission])
  @Type(() => Permission)
  permissions?: Permission[]
}

export const AccountAdminSchema = SchemaFactory.createForClass(AccountAdmin)
