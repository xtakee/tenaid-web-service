import { AccountResponseDto } from "src/feature/account/dto/response/account.response.dto";
import { CommunityDto } from "../community.dto";

export class Member {
  id?: string
  account: AccountResponseDto
  path?: string
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
