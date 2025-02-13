import { AddressDto } from "src/feature/core/dto/address.dto"
import { Email } from "src/feature/core/model/email"


export class _KYC {
  profileCompleted?: Boolean

  addressCompleted?: Boolean

  bankingCompleted?: Boolean
}

export class DashboardFlagsDto {
  welcome?: Boolean

  quickActions?: Boolean

  joinCommunity?: Boolean

  createCommunity?: Boolean
}

export interface Role {
  id: string
  name: string
  photo: string
  email: string
  isOwner: Boolean
}

interface AccType {
  type: string,
  approved: Boolean
}

export class AccountResponseDto {
  id: string
  firstName: string
  lastName: string
  hasCommunity?: Boolean
  email: Email
  phone: string
  gender?: string
  country?: string
  photo: string
  identity: string
  identityType: string
  idNumber: string
  dob?: Date
  flags: DashboardFlagsDto
  kycCompleted?: Boolean
  communityKycAcknowledged?: Boolean
  communitySetup?: {} = {
    street: false,
    building: false,
    member: false
  }
  primaryAccountType?: string
  accountTypes?: AccType[]
  proofOfId?: string
  kyc?: _KYC
  managedAccounts?: Role[]
  address?: AddressDto
}
