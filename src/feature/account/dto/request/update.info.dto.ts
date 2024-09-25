import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsDateString, IsUrl, IsOptional, IsEnum } from "class-validator"
import { IsMinAge } from "src/core/validators/is.min.age"
import { GENDER } from "src/feature/auth/auth.constants"

export class UpdateInfoDto {
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
  @IsEnum(GENDER)
  gender: string

  @ApiProperty()
  @IsNotEmpty()
  firstName: string

  @ApiProperty()
  @IsNotEmpty()
  lastName: string

  @ApiProperty()
  @IsNotEmpty()
  country: string

  @ApiProperty()
  @IsOptional()
  photo?: string
}
