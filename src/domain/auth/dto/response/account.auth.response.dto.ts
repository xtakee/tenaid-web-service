import { ApiProperty } from "@nestjs/swagger"
import { AccountResponseDto } from "src/domain/account/dto/response/account.response.dto"

export class AccountAuthResponseDto {
  @ApiProperty()
  account: AccountResponseDto

  @ApiProperty()
  authorization: string
}
