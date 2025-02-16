import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument, Types } from "mongoose"
import { Platform } from "src/core/util/platform"
import { Account } from "src/feature/account/model/account.model"

export type E2eeKeyDocument = HydratedDocument<E2eeKey>

@Schema({ timestamps: true })
export class E2eeKey {

  @Prop({ type: Types.ObjectId, ref: Account.name })
  account: Types.ObjectId

  @Prop()
  parentKey: string

  @Prop()
  publicKey: string

  @Prop()
  privateKey: string

  @Prop()
  sharedKey: string

  @Prop({ enum: Platform })
  platform: string
}

export const E2eeKeySchema = SchemaFactory.createForClass(E2eeKey)
