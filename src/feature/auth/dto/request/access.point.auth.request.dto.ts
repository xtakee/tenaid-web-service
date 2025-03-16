import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsEmail, IsMongoId } from "class-validator"

export class AccessPointAuthRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  access: string

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  guard: string

  @ApiProperty()
  @IsNotEmpty()
  password: string
}
