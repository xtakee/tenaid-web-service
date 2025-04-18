import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEmail, IsEnum, IsMongoId, IsNotEmpty, IsOptional, ValidateIf } from "class-validator";
import { BUILDING_CATEGORY } from "src/core/enums/building.type";
import { IsUniqueArray } from "src/core/validators/is.unique.array";

export class CommunityBuildingDto {
  @IsOptional()
  @IsMongoId()
  _id?: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(BUILDING_CATEGORY)
  category: string

  @IsOptional()
  @ApiProperty()
  @ValidateIf((params) => params.type === BUILDING_CATEGORY.BUSINESS)
  name?: string

  @IsOptional()
  @ApiProperty()
  @ValidateIf((params) => params.type === BUILDING_CATEGORY.BUSINESS)
  description?: string

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