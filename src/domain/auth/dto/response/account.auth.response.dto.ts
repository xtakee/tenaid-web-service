import { ApiProperty } from "@nestjs/swagger"
import { AccountResponseDto } from "src/domain/account/dto/response/account.response.dto"
import { CLAIM } from "src/feature/auth/auth.constants"

export interface Role {
  id: string
  name: string
  photo: string
}

export class AccountAuthResponseDto {
  @ApiProperty()
  account: AccountResponseDto

  @ApiProperty()
  authorization: string

  @ApiProperty()
  managedAccounts?: Role[]
}
