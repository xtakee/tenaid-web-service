import { Email } from "src/domain/core/model/email"


export class _KYC {
  profileCompleted?: boolean

  addressCompleted?: boolean

  bankingCompleted?: boolean
}

export interface Role {
  id: string
  name: string
  photo: string
}

interface AccType {
  type: string,
  approved: boolean
}

export class AccountResponseDto {
  id: string
  firstName: string
  lastName: string
  email: Email
  phone: string
  photo: string
  dob: string
  primaryAccountType?: string
  accountTypes?: AccType[]
  proofOfId?: string
  kyc?: _KYC
  managedAccounts?: Role[]
}
