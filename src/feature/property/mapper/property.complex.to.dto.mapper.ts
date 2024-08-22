import { Mapper } from "src/core/util/mapper";
import { PropertyComplex } from "../model/property.complex.model";
import { PropertyComplexResponeDto } from "src/feature/property/dto/response/property.complex.response.dto";
import { Injectable } from "@nestjs/common";
import { AddressToDtoMapper } from "src/feature/core/mapper/address.to.dto.mapper";

@Injectable()
export class PropertyComplexToDtoMapper implements Mapper<PropertyComplex, PropertyComplexResponeDto> {
  constructor(private readonly addressMapper: AddressToDtoMapper) { }

  map(from: PropertyComplex): PropertyComplexResponeDto {
    return {
      name: from.name,
      description: from.description,
      media: from.media,
      allowPets: from.allowPets,
      address: this.addressMapper.map(from.address)
    }
  }
}
