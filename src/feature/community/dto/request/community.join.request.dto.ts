import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsMongoId, IsNotEmpty, IsNumber } from "class-validator";

export class CommunityJoinRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  community: string

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isPrimary?: boolean

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
  apartment: string
}
