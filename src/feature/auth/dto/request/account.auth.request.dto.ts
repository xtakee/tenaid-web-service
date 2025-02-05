import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsEnum, IsNotEmpty } from "class-validator"

enum Platform {
  WEB = 'web',
  MOBILE = 'mobile'
}

export class AccountAuthRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  username: string

  @ApiProperty()
  @IsNotEmpty()
  password: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(Platform)
  platform: string
}
