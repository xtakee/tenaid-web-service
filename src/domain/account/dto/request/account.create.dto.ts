import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty } from "class-validator"

export class AccountCreateDto {
  @IsNotEmpty()
  @ApiProperty()
  password: string

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string

  @IsNotEmpty()
  @ApiProperty()
  firstName: string

  @IsNotEmpty()
  @ApiProperty()
  lastName: string
}
