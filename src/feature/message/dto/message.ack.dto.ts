import { IsNotEmpty, IsMongoId } from "class-validator"

export class MessageAckDto {
  @IsNotEmpty()
  @IsMongoId()
  message: string

  @IsNotEmpty()
  @IsMongoId()
  community: string

  @IsNotEmpty()
  @IsMongoId()
  room: string
}