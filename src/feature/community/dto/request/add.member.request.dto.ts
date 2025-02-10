import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsUrl } from "class-validator";
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
  street: string

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  building: string

  @ApiProperty()
  @IsOptional()
  @IsUrl()
  photo?: string

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  canSendMessages?: Boolean

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isAdmin?: Boolean

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  dob: string

  @ApiProperty()
  @IsNotEmpty()
  apartment: string
}