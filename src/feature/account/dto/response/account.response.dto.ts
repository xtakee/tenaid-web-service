import { AddressDto } from "src/feature/core/dto/address.dto"
import { Email } from "src/feature/core/model/email"


export class _KYC {
  profileCompleted?: boolean

  addressCompleted?: boolean

  bankingCompleted?: boolean
}

export class DashboardFlagsDto {
  welcome?: boolean

  quickActions?: boolean

  joinCommunity?: boolean

  createCommunity?: boolean
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
  country?: string
  photo: string
  dob?: string
  flags: DashboardFlagsDto
  kycCompleted?: boolean
  primaryAccountType?: string
  accountTypes?: AccType[]
  proofOfId?: string
  kyc?: _KYC
  managedAccounts?: Role[]
  address?: AddressDto
}
