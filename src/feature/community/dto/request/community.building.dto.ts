import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEmail, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { BUILDING_CATEGORY, BUILDING_TYPE } from "src/core/enums/building.type";
import { IsUniqueArray } from "src/core/validators/is.unique.array";

export class CommunityBuildingDto {
  @IsOptional()
  @IsMongoId()
  _id?: string

  @IsOptional()
  @ApiProperty()
  name: string

  @IsOptional()
  @ApiProperty()
  description: string

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  street: string

  @ApiProperty()
  @IsNotEmpty()
  buildingNumber: String

  @ApiProperty()
  @IsNotEmpty()
  contactCountry: string

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

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  @IsUniqueArray()
  flats: string[]
}