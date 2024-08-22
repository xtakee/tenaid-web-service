import { Member } from "./community.invite.response.dto"

export class CommunityVisitorsDto {
  id?: string
  photo?: string
  name?: string
  access?: string
  checkIn?: string
  checkOut?: string
  createdAt?: string
  expected?: string
  host?: Member
}
