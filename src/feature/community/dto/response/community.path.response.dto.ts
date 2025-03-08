import { CommunityDto } from "../community.dto"

export class CommunityPathResponseDto {
  _id?: string

  name: string

  description: string

  createdAt: Date

  updatedAt: Date

  community: string

  isActive: Boolean

  createdBy: {}
}
