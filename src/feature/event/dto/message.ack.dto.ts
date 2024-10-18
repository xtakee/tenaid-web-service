import { IsMongoId, IsNotEmpty } from "class-validator";

export class MessageAckDto {
  @IsNotEmpty()
  @IsMongoId()
  message: string

  @IsNotEmpty()
  @IsMongoId()
  community: string
}