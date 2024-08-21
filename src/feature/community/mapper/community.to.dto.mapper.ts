import { Injectable } from "@nestjs/common";
import { Mapper } from "src/core/util/mapper";
import { Community } from "../model/community";
import { CommunityDto } from "src/domain/community/dto/community.dto";
import { AddressToDtoMapper } from "src/feature/core/mapper/address.to.dto.mapper";

@Injectable()
export class CommunityToDtoMapper implements Mapper<Community, CommunityDto> {
  constructor(private readonly addressMapper: AddressToDtoMapper) { }

  map(from: Community): CommunityDto {
    return {
      id: (from as any)._id,
      name: from.name,
      description: from.description,
      address: this.addressMapper.map(from.address),
      code: from.code,
      type: from.type,
      image: from.image
    }
  }
}
