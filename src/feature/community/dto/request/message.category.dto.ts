import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty } from "class-validator"

export class MessageCategoryDto {

  id?: string

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
