import { MessageRequestDto } from "./message.request"

export class MessageCacheDto {
  _id: string
  type: string
  message: MessageRequestDto
}