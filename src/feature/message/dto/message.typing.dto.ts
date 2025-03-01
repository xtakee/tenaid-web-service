import { IsNotEmpty, IsMongoId } from "class-validator"

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