import { ApiProperty } from "@nestjs/swagger"
import { IsLatitude, IsLongitude, IsNotEmpty, IsUrl } from "class-validator"

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
  @IsLatitude()
  latitude?: string

  @ApiProperty()
  @IsNotEmpty()
  @IsLongitude()
  longitude?: string
}