import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsMongoId, IsNotEmpty } from "class-validator";
import { IsHourInRange } from "src/core/validators/is.hour.range";

export class CommunityInviteDto {
  code?: string
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
  name: string

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  community: string

  @ApiProperty()
  photo?: string

  @ApiProperty()
  reason: string
}