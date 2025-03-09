import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty } from "class-validator";

export class CommunityAccessPointRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsNotEmpty()
  description: string

  @ApiProperty()
  @IsNotEmpty()
  isActive: Boolean
}