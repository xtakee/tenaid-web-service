import { Injectable } from "@nestjs/common";
import { Mapper } from "src/core/util/mapper";
import { CommunityMemberResponseDto } from "../dto/response/community.member.response.dto";
import { CommunityPathToDtoMapper } from "./community.path.to.dto.mapper";
import { CommunityAccountToDtoMapper } from "./community.account.to.dto.mapper";

@Injectable()
export class CommunityMemberResponseToDtoMapper implements Mapper<any, CommunityMemberResponseDto> {
  constructor(
    private readonly pathMapper: CommunityPathToDtoMapper,
    private readonly memberMapper: CommunityAccountToDtoMapper
  ) { }

  map(from: any): CommunityMemberResponseDto {
    return {
      path: this.pathMapper.map(from.path),
      account: this.memberMapper.map(from.account),
      code: from.code,
      point: from.point,
      description: from.description,
      createdAt: from.createdAt,
      updatedAt: from.updatedAt,
      status: from.status
    }
  }

}