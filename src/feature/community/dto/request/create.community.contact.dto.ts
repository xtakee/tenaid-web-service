import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateCommunityContactDto {
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
  tag: string

  @ApiProperty()
  @IsNotEmpty()
  isActive: Boolean
}
