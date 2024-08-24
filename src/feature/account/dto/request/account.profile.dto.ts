import { ApiProperty } from "@nestjs/swagger"
import { IsDateString, IsNotEmpty, IsUrl } from "class-validator"
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
  proofOfId: string
}
