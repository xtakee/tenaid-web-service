import { Prop, Schema } from "@nestjs/mongoose"
import { GENDER } from "src/feature/auth/auth.constants"
import { Email } from "src/feature/core/model/email.model"

export class MemberAccount {
  @Prop()
  firstName: string

  @Prop()
  lastName: string

  @Prop({ enum: GENDER })
  gender: string

  @Prop({ type: Email })
  email: Email

  @Prop()
  photo?: string

  @Prop()
  phone: string

  @Prop()
  dob?: Date

  @Prop({ default: false })
  isAdmin?: Boolean

  @Prop()
  country: string
}
