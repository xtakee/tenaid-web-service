import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class AccountLogoutRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  platform: string
}