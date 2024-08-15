import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { AddressDto } from "src/domain/core/dto/address.dto";

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
  address: AddressDto

  @ApiProperty()
  @IsNotEmpty()
  allowPets: boolean

  @ApiProperty()
  @IsNotEmpty()
  floors: number
}