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
      kyc: {
        profileCompleted: from.kyc?.profileCompleted,
        addressCompleted: from.kyc?.addressCompleted,
        bankingCompleted: from.kyc?.bankingCompleted
      },
      primaryAccountType: from.primaryAccountType || null,
      accountTypes: from.accountTypes,
      phone: from.phone || null,
      photo: from.photo || null,
      dob: from.dob?.toString() || null,
      proofOfId: from.proofOfId || null
    }
  }
}