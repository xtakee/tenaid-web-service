import { Email } from "src/feature/core/model/email.model"

export class CommunityGuardResponseDto {
  _id: string
  email: Email
  phone: string
  country: string
  encPassword: string
  code: string
  isActive: Boolean
  createdBy: {}
  community: {}
}