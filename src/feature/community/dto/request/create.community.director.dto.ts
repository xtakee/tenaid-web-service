import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsEnum, IsUrl } from "class-validator"
import { IDENTITY_TYPE } from "src/core/enums/identity.type"

export class CreateCommunityDirectorDto {
  @ApiProperty()
  @IsNotEmpty()
  firstName: string

  @ApiProperty()
  @IsNotEmpty()
  lastName: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(IDENTITY_TYPE)
  identityType: string

  @ApiProperty()
  @IsNotEmpty()
  @IsUrl()
  identity: string

  @ApiProperty()
  @IsNotEmpty()
  email: string

  @ApiProperty()
  @IsNotEmpty()
  phone: string

  @ApiProperty()
  @IsNotEmpty()
  country: string
}