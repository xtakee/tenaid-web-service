import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsNotEmpty } from "class-validator";

enum STATUS_TYPE {
  APPROVED = 'appoved',
  DENIED = 'denied'
}

export class CommunityRequestStatusDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  request: string

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  community: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(STATUS_TYPE)
  status: string

  @ApiProperty()
  @IsNotEmpty()
  comment: string
}
