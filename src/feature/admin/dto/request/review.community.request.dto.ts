import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsNotEmpty } from "class-validator";
import { STATUS_TYPE } from "src/feature/community/dto/request/community.request.status.dto";

export class ReviewCommunityRequestDto {
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