import { Mapper } from "src/core/util/mapper";
import { BankAccount } from "../model/bank.account.model";
import { BankAccountResponseDto } from "src/feature/account/dto/response/bank.account.response.dts";

export class BankAccountToDtoMapper implements Mapper<BankAccount, BankAccountResponseDto> {
  map(from: BankAccount): BankAccountResponseDto {
    return {
      id: (from as any)._id,
      name: from.bank.name,
      number: from.number,
      country: from.bank.country,
      currency: from.bank.currency,
      isPrimary: from.isPrimary
    }
  }
}
