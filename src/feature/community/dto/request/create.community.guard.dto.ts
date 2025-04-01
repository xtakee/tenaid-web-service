import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsNotEmpty } from "class-validator";
import { E2eeData } from "src/feature/e2ee/model/e2ee.data";

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
  enPassword?: E2eeData
  code?: string
}