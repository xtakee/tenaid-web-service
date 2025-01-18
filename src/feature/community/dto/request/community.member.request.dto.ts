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
  street?: string

  @ApiProperty()
  @IsNotEmpty()
  building?: string

  @ApiProperty()
  @IsNotEmpty()
  proofOfAddress?: string

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isPrimary?: boolean

  @ApiProperty()
  @IsNotEmpty()
  apartment?: string
}
