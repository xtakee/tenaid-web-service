import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty } from "class-validator";

export class CommunityMemberDto {

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
  point?: number

  @ApiProperty()
  @IsNotEmpty()
  description?: string
}
