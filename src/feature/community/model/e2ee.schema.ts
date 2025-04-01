import { Prop } from "@nestjs/mongoose"

export class E2eeDataSchema {
  @Prop()
  enc?: string

  @Prop()
  iv?: string

  @Prop()
  tag?: string
}