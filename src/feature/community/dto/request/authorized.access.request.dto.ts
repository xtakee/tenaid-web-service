import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsMongoId, IsNotEmpty } from "class-validator";

export class AuthorizedAccessRequestDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  member: string

  @ApiProperty()
  @IsNotEmpty()
  firstName: string

  @ApiProperty()
  @IsNotEmpty()
  lastName: string

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  emailAddress: string

  @ApiProperty()
  @IsNotEmpty()
  phoneNumber: string

  @ApiProperty()
  @IsNotEmpty()
  country: string
}

