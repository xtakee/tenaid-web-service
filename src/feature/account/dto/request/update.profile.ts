import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsDateString, IsUrl, IsEnum } from "class-validator"

export class UpdateProfileDto {
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
  firstName: string

  @ApiProperty()
  @IsNotEmpty()
  lastName: string

  @ApiProperty()
  @IsNotEmpty()
  country: string
}