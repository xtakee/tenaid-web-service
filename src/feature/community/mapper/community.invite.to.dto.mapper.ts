import { Injectable } from "@nestjs/common";
import { Mapper } from "src/core/util/mapper";
import { CommunityInviteResponseDto } from "src/domain/community/dto/response/community.invite.response.dto";

@Injectable()
export class CommunityInviteToDtoMapper implements Mapper<any, CommunityInviteResponseDto> {
  map(from: any): CommunityInviteResponseDto {
    return {
      id: from._id,
      community: from.community,
      host: from.member,
      visitor: from.name,
      code: from.code,
      expected: from.expected,
      status: from.status
    }
  }
}
