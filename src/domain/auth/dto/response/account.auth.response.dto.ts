import { ApiProperty } from "@nestjs/swagger"
import { AccountResponseDto } from "src/domain/account/dto/response/account.response.dto"

export interface RoleDto {
  id: string
  name: string
  photo: string
}

export interface PermissionDto {
  authorization: string
  claim: string
}


export class AccountAuthResponseDto {
  @ApiProperty()
  account: AccountResponseDto

  @ApiProperty()
  authorization: string

  @ApiProperty()
  managedAccounts?: RoleDto[]
}
