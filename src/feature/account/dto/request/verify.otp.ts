import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, MinLength } from "class-validator"

export class VerifyOtpDto {
  @ApiProperty()
  @IsNotEmpty()
  signature: string

  @ApiProperty()
  @IsNotEmpty()
  otp: string
}
