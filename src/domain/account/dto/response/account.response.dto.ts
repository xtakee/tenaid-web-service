import { Email } from "src/domain/core/model/email"

export class AccountResponseDto {
  id: string
  firstName: string
  lastName: string
  email: Email
  phone: string
  photo: string
  dob: string
  canOwn?: boolean
  canPublish?: boolean
  proofOfId?: string
}
