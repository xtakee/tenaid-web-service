import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { ACCESSIBILITY, AMENITIES, PROPERTY_CONDITION, UTITLITY } from "src/feature/property/property.constants";

export class PropertyAmenitiesDto {
  id?: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(PROPERTY_CONDITION)
  condition: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum([ACCESSIBILITY])
  accessibilities: string[]

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum([AMENITIES])
  amenities: string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum([UTITLITY])
  utilities: string[]
}