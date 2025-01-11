import { ApiProperty } from "@nestjs/swagger"
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsUrl } from "class-validator"
import { GENDER } from "src/feature/auth/auth.constants"

export class CommunityAuthorizedUserDto {
  path?: string
  point?: string
  description?: string
  isPrimary?: Boolean = true
  account?: string

  @ApiProperty()
  @IsNotEmpty()
  firstName: string

  @ApiProperty()
  @IsNotEmpty()
  lastName: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsNotEmpty()
  relationship: string

  @ApiProperty()
  @IsNotEmpty()
  phone: string

  @ApiProperty()
  @IsNotEmpty()
  @IsUrl()
  photo: string

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  canCreateInvite: Boolean

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  canCreateExit: Boolean

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(GENDER)
  gender: string

  @ApiProperty()
  @IsNotEmpty()
  country: string

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  canSendMessage: Boolean
}