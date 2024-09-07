import { ApiProperty } from "@nestjs/swagger"
import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsUrl } from "class-validator"
import { AddressDto } from "src/feature/core/dto/address.dto"
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
  @IsArray()
  @ArrayNotEmpty()
  @IsUrl({}, { each: true })
  images: string[]

  @ApiProperty()
  @IsNotEmpty()
  address: AddressDto
}
