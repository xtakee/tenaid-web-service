
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { AddressDto } from "src/feature/core/dto/address.dto";

export class CreatePropertyComplexDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsNotEmpty()
  description: string

  @ApiProperty()
  @IsNotEmpty()
  address: AddressDto

  @ApiProperty()
  @IsNotEmpty()
  allowPets: boolean

  @ApiProperty()
  @IsNotEmpty()
  media: string[]
}
