import { IsEmail, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"
import { BUILDING_TYPE, BUILDING_CATEGORY } from "src/core/enums/building.type"

export class BulkBuildingDto {
  @IsNotEmpty()
  name: string = ''

  @IsOptional()
  description?: string = ''

  @IsNotEmpty()
  @IsString()
  buildingNumber: string

  @IsOptional()
  @IsNumber()
  apartments?: number = 0

  @IsNotEmpty()
  @IsEnum(BUILDING_CATEGORY)
  category: string

  @IsNotEmpty()
  contactPerson: string

  @IsNotEmpty()
  @IsEmail()
  contactEmail: string

  @IsNotEmpty()
  contactPhone: string
}