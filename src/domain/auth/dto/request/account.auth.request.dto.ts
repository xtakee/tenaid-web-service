import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty } from "class-validator"

export class AccountAuthRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  username: string

  @ApiProperty()
  @IsNotEmpty()
  password: string
}
