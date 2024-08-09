import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsNotEmpty } from "class-validator";

export enum ADD_ON_REVIEW_STATUS {
  APPROVED = 'approved',
  DENIED = 'denied'
}

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
