import { Injectable } from "@nestjs/common";
import { Mapper } from "src/core/util/mapper";
import { CommunityInviteResponseDto } from "src/feature/community/dto/response/community.invite.response.dto";
import { CommunityToDtoMapper } from "./community.to.dto.mapper";
import { CommunityMemberToDtoMapper } from "./community.member.to.dto.mapper";

@Injectable()
export class CommunityInviteToDtoMapper implements Mapper<any, CommunityInviteResponseDto> {
  constructor(
    private readonly communityMapper: CommunityToDtoMapper,
    private readonly memberMapper: CommunityMemberToDtoMapper
  ) { }

  map(from: any): CommunityInviteResponseDto {
    return {
      id: from._id,
      host: this.memberMapper.map(from.member),
      visitor: from.name,
      access: from.code,
      expected: from.expected,
      status: from.status
    }
  }
}
