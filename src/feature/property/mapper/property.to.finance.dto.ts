import { Injectable } from "@nestjs/common";
import { Mapper } from "src/core/util/mapper";
import { Property } from "../model/property.model";
import { PropertyFinanceDto } from "src/feature/property/dto/request/property.finance.dto";

@Injectable()
export class PropertyToFinanceDto implements Mapper<Property, PropertyFinanceDto> {
  map(from: Property): PropertyFinanceDto {
    return {
      id: (from as any)._id,
      price: from.price,
      legal: from.legal,
      leasePeriod: from.leasePeriod,
      caution: from.caution,
      customFees: from.customFees?.map((fee) => {
        return {
          label: fee.label,
          value: fee.value,
          oneOff: fee.oneOff
        }
      })
    }
  }

}
