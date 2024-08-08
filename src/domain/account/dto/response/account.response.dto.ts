
interface Email {
  value: string
  verified: boolean
 }

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
