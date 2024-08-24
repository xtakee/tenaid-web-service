import { MemberAccountDto } from "./community.invite.response.dto";
import { CommunityPathResponseDto } from "./community.path.response.dto";

export class CommunityMemberResponseDto {
  path: CommunityPathResponseDto
  account: MemberAccountDto
  status: string
  code: string
  point: number
  description: string
  createdAt: string
  updatedAt: string
}
