import { IsNotEmpty, IsMongoId, IsOptional } from "class-validator"

export class MessageTypingDto {
  @IsNotEmpty()
  typing: Boolean

  @IsNotEmpty()
  @IsMongoId()
  room: string

  @IsNotEmpty()
  @IsMongoId()
  community: string
}