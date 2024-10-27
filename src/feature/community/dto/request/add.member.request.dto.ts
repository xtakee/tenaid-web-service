import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsNotEmpty } from "class-validator";
import { GENDER } from "src/feature/auth/auth.constants";

export class AddMemberRequestDto {

  @ApiProperty()
  @IsNotEmpty()
  firstName: string

  @ApiProperty()
  @IsNotEmpty()
  lastName: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(GENDER)
  gender: string

  @ApiProperty()
  @IsNotEmpty()
  emailAddress: string

  @ApiProperty()
  @IsNotEmpty()
  phoneNumber: string

  @ApiProperty()
  @IsNotEmpty()
  country: string

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  path: string

  @ApiProperty()
  @IsNotEmpty()
  point: string

  @ApiProperty()
  @IsNotEmpty()
  description: string
}