import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsNotEmpty } from "class-validator";

export enum STATUS_TYPE {
  APPROVED = 'approved',
  DENIED = 'denied'
}

export class CommunityRequestStatusDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  request: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(STATUS_TYPE)
  status: string

  @ApiProperty()
  @IsNotEmpty()
  comment: string
}
