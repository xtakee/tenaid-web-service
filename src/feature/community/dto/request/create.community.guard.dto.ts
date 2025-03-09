import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsNotEmpty } from "class-validator";

export class CreateCommunityGuardDto {
  @ApiProperty()
  @IsNotEmpty()
  fullName: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsNotEmpty()
  phone: string

  @ApiProperty()
  @IsNotEmpty()
  country: string

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isActive: Boolean

  password?: string
  enPassword?: string
  code?: string
}