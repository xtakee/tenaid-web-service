import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsEmail, IsStrongPassword, MinLength } from "class-validator";
import { PASSWORD_MIN_LENGTH } from "src/feature/auth/auth.constants";

export class ResetForgotPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  signature: string

  @ApiProperty()
  @IsNotEmpty()
  otp: string

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(PASSWORD_MIN_LENGTH)
  password: string
}
