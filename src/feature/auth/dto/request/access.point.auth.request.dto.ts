import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsMongoId, IsEmail } from "class-validator"

export class AccessPointAuthRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsNotEmpty()
  password: string
}
