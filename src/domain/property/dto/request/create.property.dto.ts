import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { AddressUpdateDto } from "src/domain/core/dto/address.update.dto";

export class CreatePropertyDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsNotEmpty()
  description: string

  @ApiProperty()
  @IsNotEmpty()
  isMultiple: boolean

  @ApiProperty()
  @IsNotEmpty()
  address: AddressUpdateDto

  @ApiProperty()
  @IsNotEmpty()
  allowPets: boolean

  @ApiProperty()
  @IsNotEmpty()
  floors: number
}
