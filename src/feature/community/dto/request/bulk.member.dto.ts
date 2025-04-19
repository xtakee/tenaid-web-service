import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator"

enum Gender {
  Male = 'm',
  Female = 'f',
}

export class BulkMemberDto {
  @IsNotEmpty()
  @IsString()
  firstName: string

  @IsNotEmpty()
  @IsString()
  lastName: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsString()
  phone: string

  @IsNotEmpty()
  @IsString()
  country: string

  @IsNotEmpty()
  @IsString()
  gender: string

  @IsNotEmpty()
  @IsString()
  @IsEnum(Gender)
  dob: string
}