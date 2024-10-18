import { MessageDto } from "./message.dto"

export class CacheMessageDto {
  _id: string
  type: string
  message: MessageDto
}