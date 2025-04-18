import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, ValidateIf } from "class-validator";
import { BUILDING_CATEGORY } from "src/core/enums/building.type";
import { IsCommaSeparatedUnique } from "src/core/validators/is.coma.separated.unique";

export class BulkBuildingDto {
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
  buildingNumber: string

  @ApiProperty()
  @IsNotEmpty()
  contactCountry: string

  @ApiProperty()
  @IsNotEmpty()
  contactName: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  contactEmail: string

  @ApiProperty()
  @IsNotEmpty()
  contactPhone: string

  @ApiProperty()
  @IsNotEmpty()
  @IsCommaSeparatedUnique({message: 'Flats must be unique and not empty'})
  flats: string
}