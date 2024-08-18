import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsNotEmpty } from "class-validator";
import { PROPERTY_TYPE } from "src/feature/property/property.constants";

export class Size {
  @ApiProperty()
  @IsNotEmpty()
  length: number

  @ApiProperty()
  @IsNotEmpty()
  breadth: number
}

export class BasicPropertyInfoDto {

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  complex: string

  @ApiProperty()
  property?: string

  @ApiProperty()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsNotEmpty()
  description: string

  @ApiProperty()
  @IsNotEmpty()
  bathrooms: number

  @ApiProperty()
  @IsNotEmpty()
  bedrooms: number

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(PROPERTY_TYPE)
  type: string

  @ApiProperty()
  @IsNotEmpty()
  size: Size
}
