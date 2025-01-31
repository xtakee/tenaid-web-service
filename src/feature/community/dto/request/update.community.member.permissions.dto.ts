import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty } from "class-validator";

export class UpdateCommunityMemberPermissionsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isAdmin: boolean

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  canSendMessages: boolean
}
