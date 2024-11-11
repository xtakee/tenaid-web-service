import { IsNotEmpty, IsMongoId, IsOptional, IsEnum, IsDateString, IsArray } from "class-validator"
import { MessageType } from "src/feature/community/model/community.message"

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

  @IsNotEmpty()
  @IsMongoId()
  author: string

  @IsNotEmpty()
  @IsMongoId()
  body: string

  @IsOptional()
  description?: string

  @IsOptional()
  path?: string

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
  name?: string

  @IsOptional()
  status?: string

  @IsOptional()
  extension?: string

  @IsArray()
  reactions: any[]

  @IsOptional()
  reaction?: ReactionDto
}

export class MessageTypingDto {
  @IsNotEmpty()
  typing: Boolean

  @IsNotEmpty()
  @IsMongoId()
  community: string
}

