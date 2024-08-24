import { Injectable } from "@nestjs/common";
import { Mapper } from "src/core/util/mapper";
import { Account } from "src/feature/account/model/account.model";
import { MemberAccountDto } from "../dto/response/community.invite.response.dto";

@Injectable()
export class CommunityAccountToDtoMapper implements Mapper<Account, MemberAccountDto> {
  map(from: Account): MemberAccountDto {
    return {
      id: (from as any)._id,
      firstName: from.firstName,
      lastName: from.lastName,
      phone: from.phone,
      photo: from.phone,
      country: from.country,
      email: {
        value: from.email?.value,
        verified: from.email?.verified
      }
    }
  }

}
