import { Mapper } from "src/core/util/mapper";
import { Address } from "../model/address.model";
import { AddressDto } from "src/domain/core/dto/address.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AddressToDtoMapper implements Mapper<Address, AddressDto> {
  map(from?: Address): AddressDto {
    return {
      address: from?.address,
      city: from?.city,
      country: from?.country,
      postalCode: from?.postalCode,
      proofOfAddress: from?.proofOfAddress,
      latitude: from?.latitude,
      longitude: from?.longitude
    }
  }
}
