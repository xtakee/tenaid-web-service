import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { PROPERTY_TYPE } from "src/feature/property/property.constants";

export class BasicPropertyInfoDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsNotEmpty()
  description: string

  @ApiProperty()
  @IsNotEmpty()
  pets: boolean

  @ApiProperty()
  @IsNotEmpty()
  numBathrooms: number

  @ApiProperty()
  @IsNotEmpty()
  numBedrooms: number

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(PROPERTY_TYPE)
  type: string
}
