import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { BUILDING_CATEGORY, BUILDING_TYPE } from "src/core/enums/building.type";

export class CommunityBuildingDto {
  @IsOptional()
  @IsMongoId()
  _id?: string

  @IsOptional()
  name?: string

  @IsOptional()
  description?: string

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  street: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  buildingNumber: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  contactCountry: string

  @ApiProperty()
  @IsNotEmpty()
  apartments: number

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(BUILDING_TYPE)
  type: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(BUILDING_CATEGORY)
  category: string

  @ApiProperty()
  @IsNotEmpty()
  contactPerson: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  contactEmail: string

  @ApiProperty()
  @IsNotEmpty()
  contactPhone: string
}