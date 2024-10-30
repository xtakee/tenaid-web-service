import { ApiProperty } from "@nestjs/swagger"
import { IsMongoId, IsNotEmpty } from "class-validator"

export class DeclineCommunityInviteDto {
  @IsNotEmpty()
  @IsMongoId()
  @ApiProperty()
  invite: string

  @IsNotEmpty()
  @ApiProperty()
  comment: string
}