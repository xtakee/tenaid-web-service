import { Prop } from "@nestjs/mongoose"
import { Types } from "mongoose"
import { Platform } from "src/core/util/platform"
import { Account } from "src/feature/account/model/account.model"

export class MessageTarget {
  @Prop({ type: Types.ObjectId, ref: Account.name })
  target?: Types.ObjectId

  @Prop({ enum: Platform })
  platform: string
}
