export class Author {
  _id: string
  extra: {
    firstName: string
    lastName: string
    photo: string
  }
  isAdmin: boolean
}

export class MessageCommunity {
  _id: string
  name: string
}

export class MessageResonseDto {
  _id: string
  community: MessageCommunity;
  author: Author
  messageId: string
  repliedTo: string | null;
  body: string
  type: string
  name?: string
  size?: number
  extension?: string
  date: Date
}