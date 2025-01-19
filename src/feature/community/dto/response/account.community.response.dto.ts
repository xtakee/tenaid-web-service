import { CommunityDto } from "../community.dto";
import { CommunityPathResponseDto } from "./community.path.response.dto";

export class AccountCommunityResponseDto {
  id: string
  community?: CommunityDto
  street: CommunityPathResponseDto
  building: any
  extra: any
  description?: string
  code: string
  status: string
  isAdmin: boolean = false
  isPrimary: boolean = false
  createdAt: string
  updatedAt: string
}
