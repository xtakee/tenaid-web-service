import { CommunityDto } from "../community.dto";
import { CommunityPathResponseDto } from "./community.path.response.dto";

export class AccountCommunityResponseDto {
  id: string
  community?: CommunityDto
  path: CommunityPathResponseDto
  point: string
  description?: string
  code: string
  status: string
  createdAt: string
  updatedAt: string
}
