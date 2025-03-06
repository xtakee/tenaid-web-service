import { Mapper } from "src/core/util/mapper";
import { Billable } from "../model/billable";
import { BillableDto } from "../dto/response/billable.dto";

export class BillableDtoMapper implements Mapper<Billable, BillableDto> {
  map(from: Billable): BillableDto {
    return {
      _id: (from as any)._id,
      name: from.name,
      description: from.description,
      startDate: from.startDate,
      status: from.status,
      type: from.type,
      frequency: from.frequency,
      amount: from.amount,
      billClass: from.billClass
    }
  }

}