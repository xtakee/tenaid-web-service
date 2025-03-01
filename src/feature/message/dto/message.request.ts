import { IsNotEmpty, IsMongoId, IsArray, IsDateString, IsOptional, IsEnum } from "class-validator"
import { EncryptionData } from "src/feature/e2ee/dto/encryption.data"
import { MessageType } from "../util/message.type"
import { ReactionDto } from "./message.reaction.dto"


export class MessageRequestDto {
  @IsNotEmpty()
  @IsMongoId()
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

  @IsMongoId()
  deletedBy?: string

  @IsMongoId()
  room: string

  @IsOptional()
  retained?: Boolean = true

  @IsOptional()
  path?: string

  @IsOptional()
  category?: string

  @IsOptional()
  visibility?: string

  @IsOptional()
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
  status?: string

  @IsOptional()
  extension?: string

  @IsArray()
  reactions: any[]

  @IsOptional()
  reaction?: ReactionDto

  encryption?: EncryptionData
}
