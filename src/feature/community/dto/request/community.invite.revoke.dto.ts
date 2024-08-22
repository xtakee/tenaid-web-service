import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty } from "class-validator";

export class CommunityInviteRevokeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  invite: string

  @ApiProperty()
  @IsNotEmpty()
  reason: string
}
