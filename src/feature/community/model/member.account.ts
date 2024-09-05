import { Prop, Schema } from "@nestjs/mongoose"
import { Email } from "src/feature/core/model/email.model"

@Schema({timestamps: true})
export class MemberAccount {
  @Prop()
  firstName: string

  @Prop()
  lastName: string

  @Prop({type: Email})
  email: Email

  @Prop()
  photo: string

  @Prop()
  phone: string

  @Prop()
  country: string
}