import { AddressDto } from "src/feature/core/dto/address.dto";

export class PropertyComplexResponeDto {
  name?: string;
  media?: string[];
  description?: string;
  allowPets?: boolean;
  address?: AddressDto
}
