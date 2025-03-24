import { IsNotEmpty, IsMongoId, IsArray, IsDateString, IsOptional, IsEnum } from "class-validator"
import { EncryptionData } from "src/feature/e2ee/dto/encryption.data"
import { MessageType } from "../util/message.type"
import { ReactionDto } from "./message.reaction.dto"
import { MessageVisibility } from "../util/message.visibility"
import { MessageStatus } from "../util/message.status"

export class MessageRequestDto {
  @IsNotEmpty()
  messageId: string

  @IsNotEmpty()
  @IsDateString()
  date: string

  @IsNotEmpty()
  @IsMongoId()
  community: string

  @IsOptional()
  @IsMongoId()
  account?: string

  @IsNotEmpty()
  @IsMongoId()
  author: string

  @IsNotEmpty()
  body: string

  @IsOptional()
  @IsMongoId()
  deletedBy?: string

  @IsNotEmpty()
  @IsMongoId()
  room: string

  @IsOptional()
  retained?: Boolean = true

  @IsOptional()
  path?: string

  @IsOptional()
  @IsMongoId()
  category?: string

  @IsOptional()
  @IsEnum(MessageVisibility)
  visibility?: string

  @IsOptional()
  @IsMongoId()
  building?: string

  @IsNotEmpty()
  @IsEnum(MessageType)
  type: string

  @IsOptional()
  @IsMongoId()
  repliedTo?: string

  @IsOptional()
  @IsMongoId()
  remoteId?: string

  @IsOptional()
  size?: number

  @IsOptional()
  @IsEnum(MessageStatus)
  status?: string

  @IsOptional()
  extension?: string

  @IsArray()
  reactions: any[]

  @IsOptional()
  reaction?: ReactionDto

  @IsNotEmpty()
  encryption: EncryptionData
}
