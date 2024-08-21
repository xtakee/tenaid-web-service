import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty } from "class-validator";

export class CommunityInviteValidateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  community: string

  @ApiProperty()
  @IsNotEmpty()
  code: string
}