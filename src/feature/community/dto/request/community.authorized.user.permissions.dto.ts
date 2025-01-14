import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsBoolean, IsMongoId } from "class-validator"

export class CommunityAuthorizedUserPermissionsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  canCreateInvite: Boolean

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  canCreateExit: Boolean

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  canSendMessage: Boolean

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  user: string
}
