import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty } from "class-validator"

export class DeclineCommunityInviteDto {
  @IsNotEmpty()
  @ApiProperty()
  comment: string
}