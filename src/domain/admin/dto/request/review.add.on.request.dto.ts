import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsNotEmpty } from "class-validator";

export const ADD_ON_REVIEW_STATUS = ['approved', 'denied']

export class ReviewAddOnRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  request: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(ADD_ON_REVIEW_STATUS)
  status: string

  @ApiProperty()
  @IsNotEmpty()
  comment: string
}
