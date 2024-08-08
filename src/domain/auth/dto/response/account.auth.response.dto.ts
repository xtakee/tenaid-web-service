import { ApiProperty } from "@nestjs/swagger"
import { AccountResponseDto } from "src/domain/account/dto/response/account.response.dto"
import { CLAIM } from "src/feature/auth/auth.constants"

export interface RoleDto {
  id: string
  name: string
  photo: string
}

export interface PermissionDto {
  authorization: string
  claim: CLAIM
}


export class AccountAuthResponseDto {
  @ApiProperty()
  account: AccountResponseDto

  @ApiProperty()
  authorization: string

  @ApiProperty()
  managedAccounts?: RoleDto[]
}
