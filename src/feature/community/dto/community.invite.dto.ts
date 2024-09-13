import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsMongoId, IsNotEmpty } from "class-validator";
import { IsHourInRange } from "src/core/validators/is.hour.range";

export class CommunityInviteDto {
  alt?: string
  status?: string
  id?: string

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  start: string

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  end: string

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  date: string

  @ApiProperty()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsNotEmpty()
  type: string

  @ApiProperty()
  @IsNotEmpty()
  code: string

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  community: string

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  member: string

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  path: string

  @ApiProperty()
  photo?: string

  @ApiProperty()
  reason?: string
}