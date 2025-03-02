import { IsNotEmpty, IsMongoId } from "class-validator"

export class MessageTypingDto {
  @IsNotEmpty()
  typing: Boolean

  @IsNotEmpty()
  @IsMongoId()
  room: string

  @IsNotEmpty()
  member?: string

  @IsNotEmpty()
  lastName?: string

  @IsNotEmpty()
  firstName?: string

  @IsNotEmpty()
  photo?: string

  @IsNotEmpty()
  isAdmin?: string

  @IsNotEmpty()
  @IsMongoId()
  community: string
}