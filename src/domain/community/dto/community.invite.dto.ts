import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsMongoId, IsNotEmpty } from "class-validator";

export class CommunityInviteDto {
  code?: string
  status?: string
  id?: string

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
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
