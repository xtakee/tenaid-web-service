import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, ValidateIf } from "class-validator";
import { BillClass } from "src/core/enums/bill.class";
import { BillFrequency } from "src/core/enums/bill.frequency";
import { BillType } from "src/core/enums/bill.type";
import { BillableStatus } from "src/core/enums/billable.status";

export class CreateBillableDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  community: string

  @ApiProperty()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsNotEmpty()
  description: string

  @ApiProperty()
  @IsEnum(BillableStatus)
  status: string

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  startDate: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(BillClass)
  billClass: string

  @ApiProperty()
  @IsEnum(BillType)
  @IsNotEmpty()
  type: string

  @ApiProperty()
  @ValidateIf((params) => params.type === BillType.RECURRING)
  @IsEnum(BillFrequency)
  frequency?: string
}