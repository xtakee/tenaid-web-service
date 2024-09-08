import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsMongoId, IsNotEmpty } from "class-validator";

export class CommunityMemberRequestDto {

  id?: string
  isAdmin?: boolean
  status?: string
  code?: string

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  path?: string

  @ApiProperty()
  @IsNotEmpty()
  point?: string

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isPrimary?: boolean

  @ApiProperty()
  @IsNotEmpty()
  description?: string
}
