import { ApiProperty } from "@nestjs/swagger"
import { Email } from "src/feature/core/model/email"

export class AccessPointAuthResponseDto {
  account: {
    _id: string
    name: string
    email: Email
    community: string
  }
  @ApiProperty()
  authorization: string
}