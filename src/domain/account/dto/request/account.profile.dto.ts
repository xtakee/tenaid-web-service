import { ApiProperty } from "@nestjs/swagger"
import { IsDateString, IsNotEmpty, IsUrl } from "class-validator"

export class AccountProfileDto {
  @IsNotEmpty()
  @IsDateString()
  @ApiProperty()
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
  proofOfId: string
}
