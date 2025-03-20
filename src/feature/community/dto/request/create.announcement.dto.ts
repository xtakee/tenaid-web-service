import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsEnum, IsDateString, ValidateIf, IsBoolean, IsOptional, IsUrl, IsArray } from "class-validator"
import { Frequency } from "src/core/enums/frequency"

export class CreateAnnouncementDto {
  @ApiProperty()
  @IsNotEmpty()
  title: string

  @ApiProperty()
  @IsNotEmpty()
  body: string

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isActive?: Boolean = true

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isRecurring?: Boolean = false

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  startDate: string

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  endDate: string

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images: string[]
  
  @ApiProperty()
  @ValidateIf((params) => params.isRecurring === true)
  @IsEnum(Frequency)
  frequency?: string
}
