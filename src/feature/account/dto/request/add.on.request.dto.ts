import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { ADD_ON } from "src/feature/auth/auth.constants";

export class AddOnRequestDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsEnum(ADD_ON)
  addOn: ADD_ON
}
