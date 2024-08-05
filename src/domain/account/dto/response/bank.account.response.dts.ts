import { ApiProperty } from "@nestjs/swagger"

export class BankAccountResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  name: string

  @ApiProperty()
  number: string

  @ApiProperty()
  country: string

  @ApiProperty()
  currency: string

  @ApiProperty()
  isPrimary: boolean
}
