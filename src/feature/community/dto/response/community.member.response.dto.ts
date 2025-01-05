import { MemberAccountDto } from "./community.invite.response.dto";
import { CommunityPathResponseDto } from "./community.path.response.dto";

export class CommunityMemberResponseDto {
  path: CommunityPathResponseDto
  account: MemberAccountDto
  status: string
  code: string
  point: number
  isOwner?: Boolean
  isAdmin?: Boolean
  canCreateInvite?: Boolean
  canCreateExit?: Boolean
  canSendMessage?: Boolean
  linkedTo?: string
  description: string
  createdAt: string
  updatedAt: string
}
