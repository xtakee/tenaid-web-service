import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsNumber } from "class-validator";

export class JoinBuildingDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  street: string

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  building: string

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  apartment: number
}