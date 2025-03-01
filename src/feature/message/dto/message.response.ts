export class Author {
  _id: string
  extra: {
    firstName: string
    lastName: string
    photo: string
    email: string
  }
  isAdmin: boolean
}

export class MessageCommunity {
  _id: string
  name: string
}

export class MessageResonseDto {
  _id: string
  community: MessageCommunity
  author: Author
  account?: string
  messageId: string
  repliedTo: string | null
  body: string
  visibility: string
  category?: string
  type: string
  name?: string
  status?: string
  size?: number
  extension?: string
  date: Date
}