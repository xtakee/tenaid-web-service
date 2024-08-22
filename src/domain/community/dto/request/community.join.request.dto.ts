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
  @IsNumber()
  point: number

  @ApiProperty()
  @IsNotEmpty()
  description: string
}
