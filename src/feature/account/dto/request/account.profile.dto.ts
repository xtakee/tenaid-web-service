import { ApiProperty } from "@nestjs/swagger"
import { IsDateString, IsEnum, IsNotEmpty, IsUrl } from "class-validator"
import { IDENTITY_TYPE } from "src/core/enums/identity.type"
import { IsMinAge } from "src/core/validators/is.min.age"

export class AccountProfileDto {
  @IsNotEmpty()
  @IsDateString()
  @ApiProperty()
  @IsMinAge(18)
  dob: string

  @ApiProperty()
  @IsNotEmpty()
  phone: string

  @ApiProperty()
  @IsNotEmpty()
  @IsUrl()
  photo: string

  @ApiProperty()
  @IsNotEmpty()
  @IsUrl()
  identity: string

  @ApiProperty()
  @IsNotEmpty()
  idNumber: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(IDENTITY_TYPE)
  identityType: string
}
