import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsEnum, IsOptional, ValidateIf, IsMongoId, IsEmail } from "class-validator"
import { BUILDING_CATEGORY } from "src/core/enums/building.type"

export class UpdateCommunityBuildingDto {
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
}