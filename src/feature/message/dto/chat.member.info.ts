export class ChatMemberInfoDto {
  id: string
  account: string
  firstName: string
  lastName: string
  photo: string
  isAdmin: Boolean

  community: string
  room: string
  typing: Boolean
}