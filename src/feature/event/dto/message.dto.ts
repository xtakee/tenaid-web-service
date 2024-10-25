import { IsNotEmpty, IsMongoId, IsOptional, IsEnum, IsDateString } from "class-validator"
import { MessageType } from "src/feature/community/model/community.message"

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
  extension?: string
}