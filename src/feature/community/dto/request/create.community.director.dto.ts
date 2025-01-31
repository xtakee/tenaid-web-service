import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsEnum, IsUrl, IsEmail, IsNumber, IsDecimal } from "class-validator"
import { IDENTITY_TYPE } from "src/core/enums/identity.type"
import { isDigit } from "src/core/helpers/code.generator"

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
  idNumber: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsNotEmpty()
  @IsDecimal()
  phone: string

  @ApiProperty()
  @IsNotEmpty()
  country: string
}