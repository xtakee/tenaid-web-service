import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsMongoId, IsNotEmpty } from "class-validator";

export class CommunityExitCodeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  invite: string

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  member: string

  @ApiProperty()
  @IsNotEmpty()
  code: string

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  date: string
}