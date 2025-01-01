import { Injectable } from "@nestjs/common";
import { Mapper } from "src/core/util/mapper";
import { Community } from "../model/community";
import { CommunityDto } from "src/feature/community/dto/community.dto";
import { AddressToDtoMapper } from "src/feature/core/mapper/address.to.dto.mapper";

@Injectable()
export class CommunityToDtoMapper implements Mapper<Community, CommunityDto> {
  constructor(private readonly addressMapper: AddressToDtoMapper) { }

  map(from: Community): CommunityDto {
    return {
      id: (from as any)._id,
      name: from.name,
      size: from.size,
      description: from.description,
      address: this.addressMapper.map(from.address),
      code: from.code,
      type: from.type,
      images: from.images
    }
  }
}
