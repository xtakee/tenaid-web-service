import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, Max, Min } from "class-validator";

export class PaginationRequestDto {
  @IsNotEmpty()
  @ApiProperty()
  @Min(1)
  page: number = 1

  @IsNotEmpty()
  @ApiProperty()
  @Min(10)
  @Max(50)
  limit: number = 10
}