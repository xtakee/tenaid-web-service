import { AccountResponseDto } from "src/domain/account/dto/response/account.response.dto";
import { CommunityDto } from "../community.dto";

class Member {
  id?: string
  account: AccountResponseDto
  path?: string
  description?: string
  point?: number
  isAdmin?: boolean
}

export class CommunityInviteResponseDto {
  id: string
  community?: CommunityDto
  host?: Member
  visitor?: string
  code?: string
  status?: string
  expected?: string
}
