import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsMongoId, IsNotEmpty } from "class-validator";
import { CheckType } from "src/feature/core/dto/check.type";

export class CheckInOutVisitorRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  member: string

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  accessPoint: string

  @ApiProperty()
  @IsNotEmpty()
  code: string

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  date: string

  @IsNotEmpty()
  @IsEnum(CheckType)
  type: string
}