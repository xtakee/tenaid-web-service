import { Mapper } from "src/core/util/mapper";
import { AccountCommunityResponseDto } from "../dto/response/account.community.response.dto";
import { Injectable } from "@nestjs/common";
import { CommunityToDtoMapper } from "./community.to.dto.mapper";
import { CommunityPathToDtoMapper } from "./community.path.to.dto.mapper";

@Injectable()
export class AccountCommunityToDtoMapper implements Mapper<any, AccountCommunityResponseDto> {

  constructor(
    private readonly communityMapper: CommunityToDtoMapper,
    private readonly pathMapper: CommunityPathToDtoMapper
  ) { }

  map(from: any): AccountCommunityResponseDto {
    return {
      id: from._id,
      isAdmin: from.isAdmin,
      isPrimary: from.isPrimary,
      community: this.communityMapper.map(from.community),
      street: this.pathMapper.map(from.street),
      building: {
        _id: from.building._id,
        buildingNumber: from.building.buildingNumber,
        type: from.building.type
      },
      extra: from.extra,
      description: from.description,
      status: from.status,
      code: from.code,
      createdAt: from.createdAt,
      updatedAt: from.updatedAt
    }
  }
}
