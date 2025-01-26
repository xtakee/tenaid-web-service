import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { Status } from "src/core/enums/status";

export class CreateUtilityProductDto {
  @ApiProperty()
  @IsNotEmpty()
  productName: string

  @ApiProperty()
  @IsNotEmpty()
  productCode: string

  @ApiProperty()
  @IsNotEmpty()
  country: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(Status)
  productStatus: string
}
