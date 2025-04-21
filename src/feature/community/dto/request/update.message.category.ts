import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty } from "class-validator"

export class UpdateMessageCategory {
  @ApiProperty()
  @IsNotEmpty()
  name: string
  
  @ApiProperty()
  @IsNotEmpty()
  description: string

  @ApiProperty()
  @IsNotEmpty()
  isReadOnly: Boolean
}