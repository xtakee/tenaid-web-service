import { Prop, Schema } from "@nestjs/mongoose"
import { Types } from "mongoose"
import { CommunityMember } from "src/feature/community/model/community.member"

export class MessageReaction {
  @Prop()
  reaction: string

  @Prop({ default: 0 })
  count: number

  @Prop([{ type: Types.ObjectId, ref: CommunityMember.name }])
  users: Types.ObjectId[]
}
