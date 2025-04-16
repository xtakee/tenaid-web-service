import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty } from "class-validator";

export class CreateCommunityFlatDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  building: string

  @ApiProperty()
  @IsNotEmpty()
  name: string
}