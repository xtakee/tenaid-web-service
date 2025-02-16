import { IsNotEmpty, IsMongoId, IsOptional, IsEnum, IsDateString, IsArray } from "class-validator"
import { MessageType } from "src/feature/community/model/community.message"
import { EncryptionData } from "src/feature/e2ee/dto/encryption.data"

export class ReactionDto {
  @IsNotEmpty()
  reaction: string

  @IsNotEmpty()
  @IsMongoId()
  user: string
}

export class MessageReaction {
  @IsNotEmpty()
  reaction: string

  @IsNotEmpty()
  count: number

  @IsArray()
  @IsMongoId({ each: true })
  users: string[]
}

export class MessageDto {
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
  @IsMongoId()
  body: string

  @IsOptional()
  retained?: Boolean = true

  @IsOptional()
  path?: string

  @IsOptional()
  category?: string

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

export class MessageTypingDto {
  @IsNotEmpty()
  typing: Boolean

  @IsNotEmpty()
  @IsMongoId()
  community: string
}

