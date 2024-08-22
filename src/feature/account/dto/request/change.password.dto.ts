import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, MinLength } from "class-validator";
import { PASSWORD_MIN_LENGTH } from "src/feature/auth/auth.constants";

export class ChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(PASSWORD_MIN_LENGTH)
  password: string
}