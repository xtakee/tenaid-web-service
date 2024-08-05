import { Mapper } from "src/core/util/mapper";
import { Account } from "../model/account.model";
import { AccountResponseDto } from "src/domain/account/dto/response/account.response.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AccountToDtoMapper implements Mapper<Account, AccountResponseDto> {
  map(from: Account): AccountResponseDto {
    return {
      id: (from as any)._id,
      lastName: from.lastName,
      firstName: from.firstName,
      email: {
        value: from.email.value,
        verified: from.email.verified
      },
      phone: from.phone,
      photo: from.photo,
      dob: from.dob?.toString(),
      proofOfId: from.proofOfId
    }
  }
}