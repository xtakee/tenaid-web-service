import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber } from "class-validator";
import { LEASE_PERIOD } from "src/feature/property/property.constants";

export class CustomFee {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  value: number

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  label: string

  @ApiProperty()
  @IsNotEmpty()
  oneOff: boolean
}

export class PropertyFinanceDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  price: number

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  caution: number

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  legal: number

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(LEASE_PERIOD)
  leasePeriod: string

  @ApiProperty()
  customFees?: CustomFee[]
}
