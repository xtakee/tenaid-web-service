import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsEmail, IsEnum, IsNotEmpty, ValidateNested } from "class-validator";
import { CLAIM, COMMUNITY_SYSTEM_FEATURES } from "src/feature/auth/auth.constants";

export class PermissionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(COMMUNITY_SYSTEM_FEATURES)
  authorization: string

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  @IsEnum(CLAIM, { each: true })
  claim: CLAIM[]
}

export class UpdateRoleDto {
  @ApiProperty()
  @IsNotEmpty()
  firstName: string

  @ApiProperty()
  @IsNotEmpty()
  lastName: string

  @ApiProperty()
  @IsNotEmpty()
  phone: string

  @ApiProperty()
  @IsNotEmpty()
  country: string

  @ApiProperty()
  @IsNotEmpty()
  isActive: Boolean

  @ApiProperty({ type: [PermissionDto] })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permissions: PermissionDto[]
}

export class CreateRoleDto {
  name?: string

  @ApiProperty()
  @IsNotEmpty()
  firstName: string

  @ApiProperty()
  @IsNotEmpty()
  lastName: string

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
  isActive: Boolean

  @ApiProperty({ type: [PermissionDto] })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permissions: PermissionDto[]
}