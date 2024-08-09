import { ApiProperty } from "@nestjs/swagger"
import { AccountAdminResponseDto } from "./account.admin.response.dto"

export class AccountAdminAuthResponseDto {
  @ApiProperty()
  account: AccountAdminResponseDto

  @ApiProperty()
  authorization: string
}
