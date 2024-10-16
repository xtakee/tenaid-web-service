import { IsMongoId, IsNotEmpty } from "class-validator"

export class UpdateMessageRequestDto {
  @IsMongoId()
  @IsNotEmpty()
  community: string

  @IsMongoId()
  @IsNotEmpty()
  message: string

  @IsMongoId()
  @IsNotEmpty()
  body: string
}