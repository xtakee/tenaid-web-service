import { ApiProperty } from "@nestjs/swagger"
import { IsDateString, IsNotEmpty, IsUrl } from "class-validator"
import { IsAgeInRange } from "src/core/validators/is.age.range"

export class AccountProfileDto {
  @IsNotEmpty()
  @IsDateString()
  @ApiProperty()
  @IsAgeInRange(18)
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
