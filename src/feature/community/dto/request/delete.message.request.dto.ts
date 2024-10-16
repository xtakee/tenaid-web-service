import { IsMongoId, IsNotEmpty, isNotEmpty } from "class-validator";

export class DeleteMessageRequestDto {
  @IsMongoId()
  @IsNotEmpty()
  community: string

  @IsMongoId()
  @IsNotEmpty()
  message: string
}