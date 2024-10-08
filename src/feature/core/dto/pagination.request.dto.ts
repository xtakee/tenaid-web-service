import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDateString, IsInt, IsNotEmpty, IsOptional, Max, Min } from "class-validator";

export class PaginationRequestDto {
  @IsNotEmpty()
  @ApiProperty({ default: 1 })
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  @Min(1)
  page: number = 1

  @IsNotEmpty()
  @ApiProperty({ default: 10 })
  @Transform(({ value }) => parseInt(value, 10))
  @Min(1)
  @Max(50)
  limit: number = 10
}

export class DateRangeDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsDateString()
  start: string

  @IsNotEmpty()
  @ApiProperty()
  @IsDateString()
  end: string
}

export class DateDto {
  @IsOptional()
  @IsDateString()
  date: string
}