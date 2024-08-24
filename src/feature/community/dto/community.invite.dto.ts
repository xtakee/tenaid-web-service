import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsMongoId, IsNotEmpty } from "class-validator";
import { IsHourInRange } from "src/core/validators/is.hour.range";

export class CommunityInviteDto {
  code?: string
  status?: string
  id?: string

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  @IsHourInRange(0, 24)
  expected: string

  @ApiProperty()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  community: string

  @ApiProperty()
  photo?: string
}