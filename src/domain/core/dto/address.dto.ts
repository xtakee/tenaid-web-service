import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsUrl } from "class-validator"

export class AddressDto {
  @ApiProperty()
  @IsNotEmpty()
  address: string

  @ApiProperty()
  @IsNotEmpty()
  city: string

  @ApiProperty()
  @IsNotEmpty()
  country: string

  @ApiProperty()
  @IsNotEmpty()
  postalCode: string

  @ApiProperty()
  @IsNotEmpty()
  @IsUrl()
  proofOfAddress: string

  @ApiProperty()
  @IsNotEmpty()
  latitude?: string

  @ApiProperty()
  @IsNotEmpty()
  longitude?: string
}