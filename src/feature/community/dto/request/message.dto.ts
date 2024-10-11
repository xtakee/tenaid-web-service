import { IsNotEmpty, IsMongoId, IsOptional, IsEnum, IsDateString } from "class-validator"

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file'
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

  @IsNotEmpty()
  @IsEnum(MessageType)
  type: string

  @IsOptional()
  @IsMongoId()
  repliedTo?: string
}