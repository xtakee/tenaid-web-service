import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsUrl } from "class-validator"
import { AddressDto } from "src/feature/core/dto/address.dto"
import { COMMUNITY_TYPE } from "src/feature/community/community.constants"

export class CommunityDto {
  id?: string
  isPrimary?: Boolean

  @ApiProperty()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsOptional()
  description?: string

  code?: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(COMMUNITY_TYPE)
  type: string

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  size: number

  @ApiProperty()
  @IsOptional()
  @IsUrl()
  logo?: string

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images: string[]

  @ApiProperty()
  @IsNotEmpty()
  address: AddressDto
}
