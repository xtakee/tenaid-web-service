import { Injectable } from "@nestjs/common";
import { Mapper } from "src/core/util/mapper";
import { Member } from "src/domain/community/dto/response/community.invite.response.dto";
import { AccountToDtoMapper } from "src/feature/account/mapper/account.to.dto.mapper";

@Injectable()
export class CommunityMemberToDtoMapper implements Mapper<any, Member> {
constructor(private readonly accountMapper: AccountToDtoMapper){}

  map(from: any): Member {
    return {
      id: from._id,
      account: this.accountMapper.map(from.account),
      path: from.path,
      description: from.description,
      point: from.point,
      isAdmin: from.isAdmin
    }
  }
}