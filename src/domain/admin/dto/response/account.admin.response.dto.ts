import { ApiProperty } from "@nestjs/swagger"
import { Email } from "src/domain/core/model/email"

export class AccountAdminResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  firstName: string

  @ApiProperty()
  lastName: string

  @ApiProperty()
  email: Email

  @ApiProperty()
  phone: string

  @ApiProperty()
  photo?: string
}
