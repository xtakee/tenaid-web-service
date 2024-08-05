import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsNumberString } from "class-validator";

export class AddBankAccountDto {
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