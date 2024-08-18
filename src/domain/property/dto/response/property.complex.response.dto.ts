import { AddressDto } from "src/domain/core/dto/address.dto";

export class PropertyComplexResponeDto {
  name?: string;
  media?: string[];
  description?: string;
  allowPets?: boolean;
  address?: AddressDto
}
