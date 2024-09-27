import { Member } from "./community.invite.response.dto"

export class CommunityVisitorsDto {
  id?: string
  photo?: string
  name?: string
  code?: string
  date?: string
  start?: string
  end?: string
  member?: Member
}
