import { IsNotEmpty, IsMongoId, IsOptional } from "class-validator"

export class MessageTypingDto {
  @IsNotEmpty()
  typing: Boolean

  @IsNotEmpty()
  @IsMongoId()
  room: string

  @IsNotEmpty()
  lastName: string

  @IsNotEmpty()
  firstName: string

  @IsOptional()
  photo?: string

  @IsNotEmpty()
  isAdmin: string

  @IsNotEmpty()
  @IsMongoId()
  community: string
}