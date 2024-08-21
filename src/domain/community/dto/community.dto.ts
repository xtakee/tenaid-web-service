import { ApiProperty } from "@nestjs/swagger"
import { IsEnum, IsNotEmpty, IsUrl } from "class-validator"
import { AddressDto } from "src/domain/core/dto/address.dto"
import { COMMUNITY_TYPE } from "src/feature/community/community.constants"

export class CommunityDto {
  id?: string

  @ApiProperty()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsNotEmpty()
  description: string

  code?: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(COMMUNITY_TYPE)
  type: string

  @ApiProperty()
  @IsNotEmpty()
  @IsUrl()
  image: string

  @ApiProperty()
  @IsNotEmpty()
  address: AddressDto
}
