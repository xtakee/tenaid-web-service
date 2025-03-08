import { Email } from "src/feature/core/model/email.model"

export class CommunityContactResponseDto {
  _id: string
  fullName: string
  email: Email
  phone: string
  country: string

  tag: string
  isActive: Boolean
  createdBy: {}
}