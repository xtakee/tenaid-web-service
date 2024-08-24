import { Email } from "src/feature/core/model/email";
import { CommunityPathResponseDto } from "./community.path.response.dto";

export class MemberAccountDto {
  id: string
  firstName: string
  lastName: string
  photo: string
  phone: string
  country: string
  email: Email
}

export class Member {
  id?: string
  account: MemberAccountDto
  path?: CommunityPathResponseDto
  description?: string
  point?: number
  isAdmin?: boolean
}

export class CommunityInviteResponseDto {
  id: string
  host?: Member
  visitor?: string
  access?: string
  status?: string
  expected?: string
  checkIn?: string
}
