import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsMongoId, IsNotEmpty, IsOptional } from "class-validator";

export class CommunityMemberRequestDto {

  id?: string
  isAdmin?: boolean
  status?: string
  code?: string
  memberId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  draft?: string

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  street?: string

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
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
