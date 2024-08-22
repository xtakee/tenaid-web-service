import { Mapper } from "src/core/util/mapper";
import { CommunityInvite } from "../model/community.invite";
import { CommunityInviteDto } from "src/feature/community/dto/community.invite.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class InviteToDtoMapper implements Mapper<CommunityInvite, CommunityInviteDto> {
  map(from: CommunityInvite): CommunityInviteDto {
    return {
      id: (from as any)._id,
      name: from.name,
      photo: from.photo,
      status: from.status,
      code: from.code,
      community: from.community?.toString(),
      expected: from.expected
    }
  }
}
