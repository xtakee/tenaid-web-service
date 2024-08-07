import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { ADD_ON } from "src/constants";

export class AddOnRequestDto {
  @IsNotEmpty()
  @ApiProperty()
  addOn: ADD_ON
}
