import { Mapper } from "src/core/util/mapper";
import { CommunityInvite } from "../model/community.invite";
import { CommunityInviteDto } from "src/feature/community/dto/community.invite.dto";
import { Injectable } from "@nestjs/common";
import { CodeGenerator } from "src/core/helpers/code.generator";

@Injectable()
export class InviteToDtoMapper implements Mapper<CommunityInvite, CommunityInviteDto> {
  constructor(private readonly codeGen: CodeGenerator) { }

  map(from: CommunityInvite): CommunityInviteDto {
    return {
      id: (from as any)._id,
      name: from.name,
      reason: from.reason,
      alt: this.codeGen.toBase32(BigInt(from.code), true),
      photo: from.photo,
      status: from.status,
      code: from.code,
      community: from.community?.toString(),
      start: from.start,
      end: from.end
    }
  }
}
