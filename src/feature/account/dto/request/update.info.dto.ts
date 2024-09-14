import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsDateString, IsUrl, IsOptional } from "class-validator"
import { IsMinAge } from "src/core/validators/is.min.age"

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
