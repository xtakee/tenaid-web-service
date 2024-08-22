import { ApiProperty } from "@nestjs/swagger"
import { IsMongoId, IsNotEmpty, IsNumberString } from "class-validator"

export class UpdateBankAccountDto {
  @IsMongoId()
  @IsNotEmpty()
  @ApiProperty()
  account: string

  @IsMongoId()
  @IsNotEmpty()
  @ApiProperty()
  bank: string

  @IsNotEmpty()
  @ApiProperty()
  isPrimary: boolean

  @IsNotEmpty()
  @IsNumberString()
  @ApiProperty()
  number: string
}