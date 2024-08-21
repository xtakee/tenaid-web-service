import { AddressDto } from "src/domain/core/dto/address.dto"
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
  email: string
  isOwner: boolean
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
  dob?: string
  kycCompleted?: boolean
  primaryAccountType?: string
  accountTypes?: AccType[]
  proofOfId?: string
  kyc?: _KYC
  managedAccounts?: Role[]
  address?: AddressDto
}
