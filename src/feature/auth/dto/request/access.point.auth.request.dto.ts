import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsEmail, IsMongoId } from "class-validator"

export class AccountPointAuthRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  access: string

  @ApiProperty()
  @IsNotEmpty()
  password: string
}
