import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsNumber } from "class-validator";

export class CommunityJoinRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  community: string

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  path: string

  @ApiProperty()
  @IsNotEmpty()
  point: string

  @ApiProperty()
  @IsNotEmpty()
  description: string
}
