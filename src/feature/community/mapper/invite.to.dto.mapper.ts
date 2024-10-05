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
      date: from.date.toISOString(),
      type: from.type,
      member: (from as any).member,
      reason: from.reason,
      alt: from.code,
      photo: from.photo,
      status: from.status,
      exitOnly: from.exitOnly,
      code: from.code,
      community: from.community?.toString(),
      start: from.start.toISOString(),
      end: from.end.toISOString()
    }
  }
}
