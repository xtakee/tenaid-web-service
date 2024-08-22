import { Mapper } from "src/core/util/mapper";
import { Account } from "../model/account.model";
import { AccountResponseDto, _KYC } from "src/domain/account/dto/response/account.response.dto";
import { Injectable } from "@nestjs/common";
import { ADD_ON } from "src/feature/auth/auth.constants";
import { AddressToDtoMapper } from "src/feature/core/mapper/address.to.dto.mapper";

function isKycCompleted(accountType?: string, kyc?: _KYC) {
  switch (accountType) {
    case ADD_ON.TENANT: return kyc?.addressCompleted
      && kyc?.profileCompleted

    case ADD_ON.AGENT:
    case ADD_ON.MANAGER: return kyc?.addressCompleted
      && kyc?.profileCompleted
      && kyc?.bankingCompleted

    default: return false
  }
}

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
      address: (new AddressToDtoMapper()).map(from.address),
      kyc: {
        profileCompleted: from.kyc?.profileCompleted,
        addressCompleted: from.kyc?.addressCompleted,
        bankingCompleted: from.kyc?.bankingCompleted
      },
      primaryAccountType: from.primaryAccountType || null,
      accountTypes: from.accountTypes?.map((t) => {
        return {
          type: t.type,
          approved: t.approved
        }
      }),
      kycCompleted: isKycCompleted(from.primaryAccountType, from.kyc),
      phone: from.phone || null,
      photo: from.photo || null,
      dob: from.dob?.toString() || null,
      proofOfId: from.proofOfId || null
    }
  }
}