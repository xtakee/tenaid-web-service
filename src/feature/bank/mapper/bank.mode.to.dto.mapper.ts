import { Mapper } from "src/core/util/mapper";
import { Bank } from "../model/bank.model";
import { BankResponseDto } from "src/feature/bank/dto/bank.response.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class BankModelToDtoMapper implements Mapper<Bank, BankResponseDto> {
  map(from: Bank): BankResponseDto {
    return {
      name: from.name,
      country: from.country,
      currency: from.currency,
      id: (from as any)._id
    }
  }
}